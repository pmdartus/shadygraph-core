import { createValue } from './value';

import type { PropertyType, Value } from './types';

export function propertyTypeDefaultValue(property: PropertyType): Value {
    return createValue(property.type, property.default);
}
