## 简介

React 16.8 于 2019.2 正式发布，这是一个能提升代码质量和开发效率的特性，笔者就抛砖引玉先列出一些实践点，希望得到大家进一步讨论。

然而需要理解的是，没有一个完美的最佳实践规范，对一个高效团队来说，稳定的规范比合理的规范更重要，因此这套方案只是最佳实践之一。

## 精读

### 环境要求

- 拥有较为稳定且理解函数式编程的前端团队。
- 开启 ESLint 插件：[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)。

### 组件定义

Function Component 采用 `const` + 箭头函数方式定义：

```tsx
const App: React.FC<{ title: string }> = ({ title }) => {
  return React.useMemo(() => <div>{title}</div>, [title]);
};

App.defaultProps = {
  title: 'Function Component'
}
```

上面的例子包含了：

1. 用 `React.FC` 申明 Function Component 组件类型与定义 Props 参数类型。
2. 用 `React.useMemo`  优化渲染性能。
3. 用 `App.defaultProps` 定义 Props 的默认值。

#### FAQ

> 为什么不用 React.memo?

推荐使用 `React.useMemo` 而不是 `React.memo`，因为在组件通信时存在 `React.useContext` 的用法，这种用法会使所有用到的组件重渲染，只有 `React.useMemo` 能处理这种场景的按需渲染。

> 没有性能问题的组件也要使用 useMemo 吗？

要，考虑未来维护这个组件的时候，随时可能会通过 `useContext` 等注入一些数据，这时候谁会想起来添加 `useMemo` 呢？

> 为什么不用解构方式代替 defaultProps?

虽然解构方式书写 `defaultProps` 更优雅，但存在一个硬伤：对于对象类型每次 Rerender 时引用都会变化，这会带来性能问题，因此不要这么做。

### 局部状态

局部状态有三种，根据常用程度依次排列： `useState` `useRef` `useReducer` 。

#### useState

```tsx
const [hide, setHide] = React.useState(false);
const [name, setName] = React.useState('BI');
```

状态函数名要表意，尽量聚集在一起申明，方便查阅。

#### useRef

```tsx
const dom = React.useRef(null);
```

`useRef` 尽量少用，大量 Mutable 的数据会影响代码的可维护性。

但对于不需重复初始化的对象推荐使用 `useRef` 存储，比如 `new G2()` 。

#### useReducer

局部状态不推荐使用 `useReducer` ，会导致函数内部状态过于复杂，难以阅读。 `useReducer` 建议在多组件间通信时，结合 `useContext` 一起使用。

#### FAQ

> 可以在函数内直接申明普通常量或普通函数吗？

不可以，Function Component 每次渲染都会重新执行，常量推荐放到函数外层避免性能问题，函数推荐使用 `useCallback` 申明。

### 函数

所有 Function Component 内函数必须用 `React.useCallback` 包裹，以保证准确性与性能。

```tsx
const [hide, setHide] = React.useState(false);
  
const handleClick = React.useCallback(() => {
  setHide(isHide => !isHide)
}, [])
```

`useCallback` 第二个参数必须写，[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) 插件会自动填写依赖项。

### 发请求

发请求分为操作型发请求与渲染型发请求。

#### 操作型发请求

操作型发请求，作为回调函数：

```tsx
return React.useMemo(() => {
  return (
    <div onClick={requestService.addList} />
  )
}, [requestService.addList])
```

#### 渲染型发请求

渲染型发请求在 `useAsync` 中进行，比如刷新列表页，获取基础信息，或者进行搜索， **都可以抽象为依赖了某些变量，当这些变量变化时要重新取数** ：

```tsx
const { loading, error, value } = useAsync(async () => {
  return requestService.freshList(id);
}, [requestService.freshList, id]);
```

### 组件间通信

简单的组件间通信使用透传 Props 变量的方式，而频繁组件间通信使用 `React.useContext` 。

以一个复杂大组件为例，如果组件内部拆分了很多模块， **但需要共享很多内部状态** ，最佳实践如下：

#### 定义组件内共享状态 - store.ts

```tsx
export const StoreContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>(null)

export interface State {};

export interface Action { type: 'xxx' } | { type: 'yyy' };

export const initState: State = {};

export const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
```

#### 根组件注入共享状态 - main.ts

```tsx
import { StoreContext, reducer, initState } from './store'

const AppProvider: React.FC = props => {
  const [state, dispatch] = React.useReducer(reducer, initState);

  return React.useMemo(() => (
    <StoreContext.Provider value={{ state, dispatch }}>
      <App />
    </StoreContext.Provider>
  ), [state, dispatch])
};
```

#### 任意子组件访问/修改共享状态 - child.ts

```tsx
import { StoreContext } from './store'

const app: React.FC = () => {
  const { state, dispatch } = React.useContext(StoreContext);
  
  return React.useMemo(() => (
    <div>{state.name}</div>
  ), [state.name])
};
```

如上解决了 **多个联系紧密组件模块间便捷共享状态的问题** ，但有时也会遇到需要共享根组件 Props 的问题，**这种不可修改的状态不适合一并塞到 `StoreContext` 里**，我们新建一个 `PropsContext` 注入根组件的 Props：

```tsx
const PropsContext = React.createContext<Props>(null)

const AppProvider: React.FC<Props> = props => {
  return React.useMemo(() => (
    <PropsContext.Provider value={props}>
      <App />
    </PropsContext.Provider>
  ), [props])
};
```

#### 结合项目数据流

参考 [react-redux hooks](https://github.com/reduxjs/react-redux/blob/master/docs/api/hooks.md)。

### debounce 优化

比如当输入框频繁输入时，为了保证页面流畅，我们会选择在 `onChange` 时进行 `debounce` 。然而在 Function Component 领域中，我们有更优雅的方式实现。

> 其实在 Input 组件 `onChange`  使用 `debounce` 有一个问题，就是当 Input 组件 **受控** 时， `debounce` 的值不能及时回填，导致甚至无法输入的问题。

我们站在 Function Component 思维模式下思考这个问题：

1. React [scheduling](https://github.com/dt-fe/weekly/blob/v2/099.%E7%B2%BE%E8%AF%BB%E3%80%8AScheduling%20in%20React%E3%80%8B.md) 通过智能调度系统优化渲染优先级，我们其实不用担心频繁变更状态会导致性能问题。
2. 如果联动一个文本还觉得慢吗？ `onChange` 本不慢，大部分使用值的组件也不慢，没有必要从 `onChange` 源头开始就 `debounce` 。
3. 找到渲染性能最慢的组件（比如 iframe 组件），**对一些频繁导致其渲染的入参进行 `useDebounce`** 。

下面是一个性能很差的组件，引用了变化频繁的 `text` （这个 `text` 可能是 `onChange` 触发改变的），我们利用 `useDebounce` 将其变更的频率慢下来即可：

```typescript
const App: React.FC = ({ text }) => {
  // 无论 text 变化多快，textDebounce 最多 1 秒修改一次
  const textDebounce = useDebounce(text, 1000)
  
  return useMemo(() => {
    // 使用 textDebounce，但渲染速度很慢的一堆代码
  }, [textDebounce])
};
```

使用 `textDebounce` 替代 `text` 可以将渲染频率控制在我们指定的范围内。

### useEffect 注意事项

事实上，`useEffect` 是最为怪异的 Hook，也是最难使用的 Hook。比如下面这段代码：

```tsx
useEffect(() => {
  props.onChange(props.id)
}, [props.onChange, props.id])
```

如果 `id` 变化，则调用 `onChange`。但如果上层代码并没有对 `onChange` 进行合理的封装，导致每次刷新引用都会变动，则会产生严重后果。我们假设父级代码是这么写的：

```tsx
class App {
  render() {
    return <Child id={this.state.id} onChange={id => this.setState({ id })} />
  }
}
```

这样会导致死循环。虽然看上去 `<App>` 只是将更新 id 的时机交给了子元素 `<Child>`，但由于 `onChange` 函数在每次渲染时都会重新生成，因此引用总是在变化，就会出现一个无限死循环：

新 `onChange` -> `useEffect` 依赖更新 -> `props.onChange` -> 父级重渲染 -> 新 `onChange`...

想要阻止这个循环的发生，只要改为 `onChange={this.handleChange}` 即可，**`useEffect` 对外部依赖苛刻的要求，只有在整体项目都注意保持正确的引用时才能优雅生效。**

然而被调用处代码怎么写并不受我们控制，这就导致了不规范的父元素可能导致 React Hooks 产生死循环。

因此在使用 `useEffect` 时要注意调试上下文，注意父级传递的参数引用是否正确，如果引用传递不正确，有两种做法：

1. 使用 [useDeepCompareEffect](https://github.com/streamich/react-use/blob/master/docs/useDeepCompareEffect.md) 对依赖进行深比较。
2. 使用 `useCurrentValue` 对引用总是变化的 props 进行包装：

```tsx
function useCurrentValue<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(null);
  ref.current = value;
  return ref;
}

const App: React.FC = ({ onChange }) => {
  const onChangeCurrent = useCurrentValue(onChange)
};
```

`onChangeCurrent` 的引用保持不变，但每次都会指向最新的 `props.onChange`，从而可以规避这个问题。

## 总结

如果还有补充，欢迎在文末讨论。

如需了解 Function Component 或 Hooks 基础用法，可以参考往期精读：

- [精读《React Hooks》](https://github.com/dt-fe/weekly/blob/v2/079.%E7%B2%BE%E8%AF%BB%E3%80%8AReact%20Hooks%E3%80%8B.md)
- [精读《怎么用 React Hooks 造轮子》](https://github.com/dt-fe/weekly/blob/v2/080.%E7%B2%BE%E8%AF%BB%E3%80%8A%E6%80%8E%E4%B9%88%E7%94%A8%20React%20Hooks%20%E9%80%A0%E8%BD%AE%E5%AD%90%E3%80%8B.md)
- [精读《useEffect 完全指南》](https://github.com/dt-fe/weekly/blob/v2/096.%E7%B2%BE%E8%AF%BB%E3%80%8AuseEffect%20%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97%E3%80%8B.md)
- [精读《Function Component 入门》](https://github.com/dt-fe/weekly/blob/v2/104.精读《Function%20Component%20入门》.md)

> 讨论地址是：[精读《React Hooks 最佳实践》 · Issue #202 · dt-fe/weekly](https://github.com/dt-fe/weekly/issues/202)

**如果你想参与讨论，请 [点击这里](https://github.com/dt-fe/weekly)，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

<img width=200 src="https://img.alicdn.com/tfs/TB165W0MCzqK1RjSZFLXXcn2XXa-258-258.jpg">

> 版权声明：自由转载-非商用-非衍生-保持署名（[创意共享 3.0 许可证](https://creativecommons.org/licenses/by-nc-nd/3.0/deed.zh)）