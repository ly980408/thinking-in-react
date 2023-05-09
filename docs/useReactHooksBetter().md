# function useReactHooksBetter() {

React Hooks 最佳实践

Reference:

- <https://juejin.cn/post/7141689678716993573>
- <https://juejin.cn/post/6888597510399623175>

## API Usage Examples

### 使用 useState 导致了不必要的渲染

❌错误示例

```jsx
const [count, setCount] = useState(0);

const addCount = () => {
  // 增加count
  setCount(c => c + 1);
};

const saveCount = () => {
  // 调用接口，保存count
  api.saveCount(count);
};

return (
  <>
    <button onClick={addCount}>增加</button>
    <button onClick={saveCount}>保存</button>
  </>
);
```

💡问题剖析

`React` 中任何 state 更新都会触发组件以及它的子组件重新渲染。

上面的示例代码中没有在 `render` 部分用到 `count` 这个 state，当每次增加计数时将会触发不需要的渲染，可能会影响性能或者产生其它副作用。

`React` 提供了一个 `useRef` Hook，返回一个可变的 ref 对象（这个 ref 对象只有一个 current 属性），其在组件的整个生命周期内保持不变。`ref` 变化不会主动使页面渲染，利用这个特性，我们可以对代码进行改造。

✅正确示例

```jsx
const countRef = useRef(0);

const addCount = () => {
  // 增加count
  countRef.current += 1;
};

const saveCount = () => {
  // 调用接口，保存count
  api.saveCount(countRef.current);
};

return (
  <>
    <button onClick={addCount}>增加</button>
    <button onClick={saveCount}>保存</button>
  </>
);
```

### 使用过时的状态

❌错误示例

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
};

// 省略其他代码...
```

💡问题剖析

虽然按钮被点击时，调用 `setCount(count + 1)`  3次，但计数只会只增加1。发生这种情况是因为状态值只会在下一次渲染中更新。
这里有一个好规则可以避免遇到过时的变量：如果你使用当前状态来计算下一个状态，总是使用函数方式来更新状态。

✅正确示例

```jsx
const handleClick = () => {
  setCount(prevCount => prevCount + 1);
  setCount(prevCount => prevCount + 1);
  setCount(prevCount => prevCount + 1);
};
```

## 最佳实践

### 使用 ESLint 的 React Hooks 插件

### 以正确的顺序编写函数式组件

```jsx
// useState, useRef, useEffect
// other functions
// return ReactNode
```

### 掌握 useEffect 中的异步用法

# }