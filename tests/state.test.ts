import test from 'node:test';import assert from 'node:assert/strict';import React from 'react';import {act,create} from 'react-test-renderer';
import {useLoanCalculator} from '../src/hooks/useLoanCalculator.ts';
import type {LoanDraft} from '../src/app/lib/types.ts';
test('each draft edit clears old result/export snapshot and retained snapshots never mix new input',()=>{
 let api:ReturnType<typeof useLoanCalculator>;function Harness(){api=useLoanCalculator();return null;}let tree:ReturnType<typeof create>;act(()=>{tree=create(React.createElement(Harness));});
 try{for(const [field,value] of [['principal','6000'],['principalUnit','억원'],['interestRate','4'],['loanTerm','12'],['loanTermUnit','년'],['gracePeriod','2'],['gracePeriodUnit','년'],['paymentType','stepUp']] as [keyof LoanDraft,LoanDraft[keyof LoanDraft]][]){act(()=>api.reset());act(()=>api.calculate());const old=api.snapshot!;assert.ok(old);act(()=>api.change(field,value));assert.equal(api.snapshot,null);assert.equal(old.loanParams.principal,50000000);assert.equal(old.loanParams.interestRate,3.5);assert.equal(old.loanParams.paymentType,'equalPayment');}}
 finally{act(()=>tree.unmount());}
});
test('invalid calculation/reset removes stale export and never accesses browser storage',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,get:()=>{throw Error('no storage allowed');}});
 let api:ReturnType<typeof useLoanCalculator>;function Harness(){api=useLoanCalculator();return null;}let tree:ReturnType<typeof create>;
 try{act(()=>{tree=create(React.createElement(Harness));});act(()=>api.calculate());assert.ok(api.snapshot);act(()=>api.change('gracePeriod','NaN'));act(()=>api.calculate());assert.equal(api.snapshot,null);assert.ok(api.error);act(()=>api.reset());assert.equal(api.snapshot,null);assert.equal(api.error,'');assert.equal(api.draft.principal,'5000');}
 finally{act(()=>tree?.unmount());if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});
