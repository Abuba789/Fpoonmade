import {makeRoom} from './levels.js';import {rollUpgrades} from './upgrades.js';
export function createRun(seed){let n=seed>>>0;const rng=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);return {seed,rng,stage:0,rooms:9,owned:new Set,mods:{},score:0,kills:0}}
export function nextRoom(run){const room=makeRoom(run.stage,run.rng()*0xffffffff);room.seed=run.seed;return room}
export function rewardChoices(run){return rollUpgrades([...run.owned],run.rng,3)}
