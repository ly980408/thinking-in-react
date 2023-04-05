# React Best Practices

> 本文非原创，为原文的中文翻译版
>
> 原文地址：https://www.freecodecamp.org/news/best-practices-for-react/

## Table of contents:

- [Three Major Challenges React Developers Face](https://www.freecodecamp.org/news/best-practices-for-react/#three-major-challenges-react-developers-face)
- [Learn The Building Blocks of React](https://www.freecodecamp.org/news/best-practices-for-react/#learn-the-building-blocks-of-react)
- [Learn How to Build Clean, Performant and Maintainable React Components](https://www.freecodecamp.org/news/best-practices-for-react/#learn-how-to-build-clean-performant-and-maintainable-react-components)
- [Tips to Help You Write Better React Code – The Cherries on Top](https://www.freecodecamp.org/news/best-practices-for-react/#tips-to-help-you-write-better-react-code-the-cherries-on-top)
- [Final Words](https://www.freecodecamp.org/news/best-practices-for-react/#final-words)



首先也是最重要的，你应该知道每一个React开发者需要去面对的**三个主要挑战**。这很重要因为当你意识到潜在的挑战时，你将会更加深入地理解这些最佳实践背后的原因。



## Three Major Challenges React Developers Face



### ⚙️ Maintainability（可维护性）

这与可复用性息息相关。在应用程序和组件非常轻量的时候，它们很容易维护。但是，一旦需求开始增长，组件就会变得非常复杂，因此维护性较差。

我经常看到一个有许多不同情况代表不同结果的组件。JSX充满条件渲染（三元运算符和简单`&&`运算符），根据条件添加class names ，或者该组件使用巨大的`Switch`语句。有许多props和state，每个都会造成不同的结果。

在我看来，这些技术本身并没有错。但是我认为，当组件开始变得较低的可维护以及这些技术变得过度使用时，每个人都应该对自己产生一种感觉。我们将在本文后面学习如何更好地控制这种情况。

问题（我也为此感到内疚）是组件越复杂、结果越不同（多态性），它就越难维护。

老实说，根本原因往往是懒惰、经验不足或时间压力，无法适当地重构组件，使其更易于维护和更整洁。

我看到的另一个关键因素是没有测试或测试很少。我知道，测试不是一个很多开发者喜爱的工作类型，但从长远来看，这确实可以帮助你。测试本身不会是这篇文章的主要话题，所以请留意我关于它的另一篇博客文章。



### 🧠 Solid Understanding of React（扎实理解React）

