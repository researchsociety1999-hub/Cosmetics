## Error Type
Build Error

## Error Message
Module not found: Can't resolve './components/ProductCard'

## Build Output
./src/app/page.tsx:5:1
Module not found: Can't resolve './components/ProductCard'
  3 | import { PromoBanner } from "./components/PromoBanner";
  4 | // FIXED: Default import (no curly braces)
> 5 | import ProductCard from "./components/ProductCard";
    | ^
  6 |
  7 | import {
  8 |   getActivePromo,

https://nextjs.org/docs/messages/module-not-found

Next.js version: 16.1.6 (Webpack)
