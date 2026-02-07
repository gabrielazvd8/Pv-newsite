
import React, { useState, useEffect } from 'react';
import * as storage from '../../services/storage';
import { Logo } from '../../types';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState('');
  const [activeLogo, setActiveLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logos = await storage.getLogos();
        const active = logos.find(l => l.ativo) || logos[0];
        if (active) {
          console.log("Logo login:", active.midia_url);
          setActiveLogo(active.midia_url);
        }
      } catch (err) {
        console.error("Erro ao carregar logo no login:", err);
      }
    };
    loadLogo();
  }, []);

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
           {activeLogo ? (
             <img 
               id="adminLoginLogo"
               src={activeLogo} 
               alt="PV Sports" 
               className="h-16 mx-auto mb-6 object-contain" 
             />
           ) : (
             <div className="h-16 mb-6 flex items-center justify-center">
                <h1 className="text-2xl font-black italic tracking-tighter text-green-500">PV<span className="text-white">SPORTS</span></h1>
             </div>
           )}
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
