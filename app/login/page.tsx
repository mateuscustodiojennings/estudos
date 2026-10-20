'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao processar a solicitação.');
      }

      // Sucesso: redireciona para a página principal
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '440px' }}>
      <div className="text-center mb-4">
        <Link href="/" className="text-decoration-none">
          <span className="brand-title fs-3">
            Estudos<span className="brand-dot">.</span>
          </span>
        </Link>
        <p className="text-muted small mt-1">Acompanhamento e evolução nos estudos</p>
      </div>

      <div className="minimal-card p-4">
        <div className="d-flex mb-4 border-bottom">
          <button
            type="button"
            className={`btn btn-link text-decoration-none flex-grow-1 pb-2 rounded-0 ${
              !isRegister
                ? 'border-bottom border-2 border-primary fw-bold text-dark'
                : 'text-muted'
            }`}
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`btn btn-link text-decoration-none flex-grow-1 pb-2 rounded-0 ${
              isRegister
                ? 'border-bottom border-2 border-primary fw-bold text-dark'
                : 'text-muted'
            }`}
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
            }}
          >
            Criar Conta
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-3">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Nome de Usuário</label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: aluno_ferretto"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoCapitalize="none"
              autoComplete="username"
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-baby-primary w-100 py-2 d-flex align-items-center justify-center gap-2 text-center"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm mx-auto" role="status" aria-hidden="true"></span>
            ) : isRegister ? (
              <span className="w-100">Criar Conta e Sincronizar</span>
            ) : (
              <span className="w-100">Acessar Meus Estudos</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center">
          <Link href="/" className="text-secondary small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Continuar sem login
          </Link>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          Seus dados de progresso ficam salvos com segurança no MongoDB Atlas.
        </p>
      </div>
    </div>
  );
}
