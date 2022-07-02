import {
    createBoolean,
    createFloat1,
    createFloat2,
    createFloat3,
    createFloat4,
    createInt1,
    createInt2,
    createInt3,
    createInt4,
} from './value';

import type { PropertyType, Value } from './types';

export function propertyTypeDefaultValue(property: PropertyType): Value {
    switch (property.type) {
        case 'boolean':
            return createBoolean(property.default);
        case 'float1':
            return createFloat1(property.default);
        case 'float2':
            return createFloat2(property.default);
        case 'float3':
            return createFloat3(property.default);
        case 'float4':
            return createFloat4(property.default);
        case 'int1':
            return createInt1(property.default);
        case 'int2':
            return createInt2(property.default);
        case 'int3':
            return createInt3(property.default);
        case 'int4':
            return createInt4(property.default);
    }
}
