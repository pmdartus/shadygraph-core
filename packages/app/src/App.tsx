import { Allotment } from 'allotment';

import Graph from './panels/Graph';

import { Panel } from './components/Panel';
import { Explorer } from './panels/Explorer';

import { Image } from './icons/Image';
import { BulletList } from './icons/BulletList';
import { TreeOutline } from './icons/TreeOutline';
import { Graph as GraphIcon } from './icons/Graph';
import { PerspectiveSelectedFace } from './icons/PerspectiveSelectedFace';

import 'allotment/dist/style.css';

function App() {
    return (
        <Allotment defaultSizes={[1, 3, 1]} separator={false}>
            <Allotment.Pane>
                <Panel title="Explorer" icon={<TreeOutline />}>
                    <Explorer />
                </Panel>
            </Allotment.Pane>
            <Allotment.Pane>
                <Allotment vertical defaultSizes={[4, 3]} separator={false}>
                    <Allotment.Pane>
                        <Panel title="Graph" icon={<GraphIcon />}>
                            <Graph />
                        </Panel>
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <Allotment separator={false}>
                            <Allotment.Pane>
                                <Panel title="3D preview" icon={<PerspectiveSelectedFace />}>
                                    TODO
                                </Panel>
                            </Allotment.Pane>
                            <Allotment.Pane>
                                <Panel title="2D preview" icon={<Image />}>
                                    TODO
                                </Panel>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                </Allotment>
            </Allotment.Pane>
            <Allotment.Pane>
                <Panel title="Properties" icon={<BulletList />}>
                    TODO
                </Panel>
            </Allotment.Pane>
        </Allotment>
    );
}

export default App;
