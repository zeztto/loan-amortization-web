import {useState,useCallback} from 'react';
import type {LoanDraft,ExportData} from '../app/lib/types';
import {calculateDraft,DEFAULT_LOAN_DRAFT} from '../app/lib/loanCalculation';
export function useLoanCalculator(){
 const [draft,setDraft]=useState<LoanDraft>({...DEFAULT_LOAN_DRAFT});const [snapshot,setSnapshot]=useState<ExportData|null>(null);const [error,setError]=useState('');
 const change=useCallback(<K extends keyof LoanDraft>(field:K,value:LoanDraft[K])=>{setDraft(previous=>({...previous,[field]:value}));setSnapshot(null);setError('');},[]);
 const calculate=()=>{setSnapshot(null);try{const next=calculateDraft(draft);setSnapshot({...next,generatedAt:new Date()});setError('');}catch(e){setError(e instanceof Error?e.message:'계산하지 못했습니다.');}};
 const reset=()=>{setDraft({...DEFAULT_LOAN_DRAFT});setSnapshot(null);setError('');};
 return {draft,snapshot,error,change,calculate,reset};
}
