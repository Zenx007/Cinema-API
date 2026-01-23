import 'reflect-metadata';

export enum Visible {
  True = 1,
  False = 0,
  Blocked = 2,
}

// Decorator para definir o nome da coluna
export function NameColumn(name: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata('nameColumn', name || propertyKey.toString(), target, propertyKey);
  };
}

// Decorator para definir a ordem da coluna
export function OrderColumn(order: number): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata('orderColumn', order ?? undefined, target, propertyKey);
  };
}

// Decorator para definir a visibilidade da coluna
export function ColumnView(visibility: Visible): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata('columnView', visibility, target, propertyKey);
  };
}

export function FrozenColumn():PropertyDecorator{
    return (target, propertyKey) =>{
        Reflect.defineMetadata("frozenColumn",true,target, propertyKey);
    }
}