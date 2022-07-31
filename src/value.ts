import type {
    BooleanValue,
    Float1Value,
    Float2Value,
    Float3Value,
    Float4Value,
    Int1Value,
    Int2Value,
    Int3Value,
    Int4Value,
    StringValue,
    Value,
    ValueMap,
} from './types';

type AssertType<T extends Value> = (value: Value) => asserts value is T;

function createValueFactory<T extends keyof ValueMap>(type: T, defaultValue: ValueMap[T]['value']) {
    return (value: ValueMap[T]['value'] = defaultValue): ValueMap[T] => {
        return {
            type,
            value,
        } as ValueMap[T];
    };
}

function isValueFactory<T extends keyof ValueMap>(type: T) {
    return (value: Value): value is ValueMap[T] => {
        return value.type === type;
    };
}

function assertValueFactory<T extends keyof ValueMap>(type: T) {
    return (value: Value): asserts value is ValueMap[T] => {
        if (value.type !== type) {
            throw new Error(`Invalid value. Expected "${type}" but received "${value.type}".`);
        }
    };
}

export function cloneValue<T extends Value>(value: T): T {
    switch (value.type) {
        case 'boolean':
        case 'string':
            return { ...value };

        case 'float1':
        case 'float2':
        case 'float3':
        case 'float4':
        case 'int1':
        case 'int2':
        case 'int3':
        case 'int4':
            return {
                ...value,
                value: value.value.slice(),
            } as T;
    }
}

export function createValue<T extends Value>(type: T['type'], value: T['value']): T {
    return { type, value } as T;
}

export const createBoolean = createValueFactory('boolean', false);
export const isBoolean = isValueFactory('boolean');
export const assertBoolean: AssertType<BooleanValue> = assertValueFactory('boolean');

export const createString = createValueFactory('string', '');
export const isString = isValueFactory('string');
export const assertString: AssertType<StringValue> = assertValueFactory('string');

export const createFloat1 = createValueFactory('float1', [0]);
export const isFloat1 = isValueFactory('float1');
export const assertFloat1: AssertType<Float1Value> = assertValueFactory('float1');

export const createFloat2 = createValueFactory('float2', [0, 0]);
export const isFloat2 = isValueFactory('float2');
export const assertFloat2: AssertType<Float2Value> = assertValueFactory('float2');

export const createFloat3 = createValueFactory('float3', [0, 0, 0]);
export const isFloat3 = isValueFactory('float3');
export const assertFloat3: AssertType<Float3Value> = assertValueFactory('float3');

export const createFloat4 = createValueFactory('float4', [0, 0, 0, 0]);
export const isFloat4 = isValueFactory('float4');
export const assertFloat4: AssertType<Float4Value> = assertValueFactory('float4');

export const createInt1 = createValueFactory('int1', [0]);
export const isInt1 = isValueFactory('int1');
export const assertInt1: AssertType<Int1Value> = assertValueFactory('int1');

export const createInt2 = createValueFactory('int2', [0, 0]);
export const isInt2 = isValueFactory('int2');
export const assertInt2: AssertType<Int2Value> = assertValueFactory('int2');

export const createInt3 = createValueFactory('int3', [0, 0, 0]);
export const isInt3 = isValueFactory('int3');
export const assertInt3: AssertType<Int3Value> = assertValueFactory('int3');

export const createInt4 = createValueFactory('int4', [0, 0, 0, 0]);
export const isInt4 = isValueFactory('int4');
export const assertInt4: AssertType<Int4Value> = assertValueFactory('int4');
