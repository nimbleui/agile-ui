import { FunctionRegistry } from "../runtime/FunctionRegistry";
import stringFun from "./string";
import arrayFun from "./array";
import objectFun from "./object";

export default function builtinFunction(registry: FunctionRegistry) {
  stringFun(registry);
  arrayFun(registry);
  objectFun(registry);
}
