import { Allotment } from 'allotment';

import { Panel } from './components/Panel';
import Graph from './panels/graph';

import 'allotment/dist/style.css';

function App() {
    return (
        <Allotment defaultSizes={[1, 3, 1]}>
            <Allotment.Pane>
                <Panel title="Explorer">TODO</Panel>
            </Allotment.Pane>
            <Allotment.Pane>
                <Allotment vertical defaultSizes={[4, 3]}>
                    <Allotment.Pane>
                        <Panel title="Graph">
                            <Graph />
                        </Panel>
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <Allotment>
                            <Allotment.Pane>
                                <Panel title="3D preview">TODO</Panel>
                            </Allotment.Pane>
                            <Allotment.Pane>
                                <Panel title="2D preview">TODO</Panel>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                </Allotment>
            </Allotment.Pane>
            <Allotment.Pane>
                <Panel title="Properties">TODO</Panel>
            </Allotment.Pane>
        </Allotment>
    );
}

export default App;
