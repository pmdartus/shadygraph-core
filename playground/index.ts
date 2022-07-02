import { createWebGPUBackend, createEngine } from '../src/main';
import { UNIFORM_COLOR } from './shaders/uniform-color';


const backend = await createWebGPUBackend();
const engine = createEngine({
    backend,
});

engine.registerShader(UNIFORM_COLOR);

const graph = engine.createGraph();

const uniformNode = graph.createNode({
    shader: '#uniform-color',
});
console.log(uniformNode)

