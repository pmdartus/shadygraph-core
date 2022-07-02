import {
    BooleanValue,
    Float1Value,
    Float2Value,
    Float3Value,
    Float4Value,
    Int1Value,
    Int2Value,
    Int3Value,
    Int4Value,
    Value,
    ValueMap,
} from './types';

export function createBoolean(value: BooleanValue['value'] = false): BooleanValue {
    return { type: 'boolean', value };
}
export function createFloat1(value: Float1Value['value'] = [0]): Float1Value {
    return { type: 'float1', value };
}
export function createFloat2(value: Float2Value['value'] = [0, 0]): Float2Value {
    return { type: 'float2', value };
}
export function createFloat3(value: Float3Value['value'] = [0, 0, 0]): Float3Value {
    return { type: 'float3', value };
}
export function createFloat4(value: Float4Value['value'] = [0, 0, 0, 0]): Float4Value {
    return { type: 'float4', value };
}
export function createInt1(value: Int1Value['value'] = [0]): Int1Value {
    return { type: 'int1', value };
}
export function createInt2(value: Int2Value['value'] = [0, 0]): Int2Value {
    return { type: 'int2', value };
}
export function createInt3(value: Int3Value['value'] = [0, 0, 0]): Int3Value {
    return { type: 'int3', value };
}
export function createInt4(value: Int4Value['value'] = [0, 0, 0, 0]): Int4Value {
    return { type: 'int4', value };
}

export function isBoolean(value: Value): value is BooleanValue {
    return value.type === 'boolean';
}
export function isFloat1(value: Value): value is Float1Value {
    return value.type === 'float1';
}
export function isFloat2(value: Value): value is Float2Value {
    return value.type === 'float2';
}
export function isFloat3(value: Value): value is Float3Value {
    return value.type === 'float3';
}
export function isFloat4(value: Value): value is Float4Value {
    return value.type === 'float4';
}
export function isInt1(value: Value): value is Int1Value {
    return value.type === 'int1';
}
export function isInt2(value: Value): value is Int2Value {
    return value.type === 'int2';
}
export function isInt3(value: Value): value is Int3Value {
    return value.type === 'int3';
}
export function isInt4(value: Value): value is Int4Value {
    return value.type === 'int4';
}

export function assertValueType<E extends Value['type']>(
    actual: Value,
    expected: E,
): asserts actual is ValueMap[E] {
    if (actual.type !== expected) {
        throw new Error(`Invalid value. Expected "${expected}" but received "${actual}".`);
    }
}

export function assertBoolean(value: Value): asserts value is BooleanValue {
    assertValueType(value, 'boolean');
}
export function assertFloat1(value: Value): asserts value is Float1Value {
    assertValueType(value, 'float1');
}
export function assertFloat2(value: Value): asserts value is Float2Value {
    assertValueType(value, 'float2');
}
export function assertFloat3(value: Value): asserts value is Float3Value {
    assertValueType(value, 'float3');
}
export function assertInt1(value: Value): asserts value is Int1Value {
    assertValueType(value, 'int1');
}
export function assertInt2(value: Value): asserts value is Int2Value {
    assertValueType(value, 'int2');
}
export function assertInt3(value: Value): asserts value is Int3Value {
    assertValueType(value, 'int3');
}

export function cloneValue<T extends Value>(value: T): T {
    switch (value.type) {
        case 'boolean':
            return createBoolean(value.value) as T;

        case 'int1':
            return createInt1(value.value.slice() as Int1Value['value']) as T;
        case 'int2':
            return createInt2(value.value.slice() as Int2Value['value']) as T;
        case 'int3':
            return createInt3(value.value.slice() as Int3Value['value']) as T;
        case 'int4':
            return createInt4(value.value.slice() as Int4Value['value']) as T;

        case 'float1':
            return createFloat1(value.value.slice() as Float1Value['value']) as T;
        case 'float2':
            return createFloat2(value.value.slice() as Float2Value['value']) as T;
        case 'float3':
            return createFloat3(value.value.slice() as Float3Value['value']) as T;
        case 'float4':
            return createFloat4(value.value.slice() as Float4Value['value']) as T;
    }
}
