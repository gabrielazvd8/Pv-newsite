
import React, { useState } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState('');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (u === 'PVadmin' && p === 'acessoPV') {
      onSuccess();
    } else {
      setError('Acesso negado. Credenciais incorretas.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-[100]">
      <div className="w-full max-w-md bg-zinc-950 p-10 rounded-[40px] border border-zinc-900 shadow-2xl">
        <div className="text-center mb-10">
           <img src="assets/img/IMG_3069.PNG" alt="PV Sports" className="h-16 mx-auto mb-6" />
           <h2 className="text-xl font-black uppercase tracking-tighter">Área Restrita</h2>
        </div>
        <form onSubmit={handle} className="space-y-6">
          <input 
            type="text" 
            placeholder="Usuário" 
            value={u} 
            onChange={e => setU(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-green-500 outline-none"
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={p} 
            onChange={e => setP(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-green-500 outline-none"
          />
          {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center">{error}</p>}
          <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-500 transition-all">Entrar</button>
          <button type="button" onClick={onCancel} className="w-full text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Voltar para Loja</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
