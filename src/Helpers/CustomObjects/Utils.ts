import { List } from "./List.Interface";
import * as Linq from "linq-es5";
export function LinqF<T>(list:List<T>){
    return Linq.from(list);
}