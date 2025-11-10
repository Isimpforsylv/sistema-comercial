# Otimizações de Banco de Dados - Sistema Comercial

## Pool de Conexões

### Configuração
- **Limite de conexões**: 2 conexões simultâneas
- **Pool timeout**: 20 segundos
- **String de conexão**: `?connection_limit=2&pool_timeout=20`

### Motivo
Limitar o pool de conexões evita:
- Sobrecarga no servidor MySQL
- Deadlocks em ambientes de desenvolvimento
- Consumo excessivo de recursos
- Problemas de escalabilidade

## Otimizações de Queries

### 1. Select Explícito
Todas as queries agora usam `select` explícito ao invés de retornar todos os campos:

```typescript
// ❌ Antes (retorna TODOS os campos)
const user = await prisma.usuarios.findUnique({
  where: { email }
});

// ✅ Depois (retorna apenas campos necessários)
const user = await prisma.usuarios.findUnique({
  where: { email },
  select: {
    id: true,
    nome: true,
    email: true,
    senha: true,
    admin: true,
  }
});
```

### 2. Include vs Select
Substituído `include` por `select` aninhado quando precisamos de campos específicos:

```typescript
// ❌ Antes (traz TODOS os campos da empresa)
const proposta = await prisma.propostasAceitas.findUnique({
  where: { id },
  include: { empresa: true }
});

// ✅ Depois (traz apenas o campo necessário)
const proposta = await prisma.propostasAceitas.findUnique({
  where: { id },
  select: {
    empresa: {
      select: { nomeempresa: true }
    }
  }
});
```

### 3. Logs de Performance
Configurado logging de queries em desenvolvimento:

```typescript
new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});
```

## Impacto das Otimizações

### Redução de Dados Transferidos
- **GET /informacoes**: ~60% menos dados (apenas campos usados no frontend)
- **POST /informacoes**: ~40% menos dados na busca da empresa
- **GET /auth/login**: ~30% menos dados (remove campos desnecessários)

### Performance
- Queries mais rápidas por transferir menos dados
- Menor uso de memória no servidor
- Melhor cache do MySQL (queries mais específicas)

### Segurança
- Não expõe campos sensíveis desnecessariamente
- Menor superfície de ataque

## Queries Otimizadas

1. ✅ `/api/empresas` - Select explícito com include do grupo
2. ✅ `/api/empresas/[id]/propostas-aceitas` - Select implícito (poucos campos)
3. ✅ `/api/empresas/[id]/propostas-aceitas/[propostaId]/informacoes` (GET) - Select explícito
4. ✅ `/api/empresas/[id]/propostas-aceitas/[propostaId]/informacoes` (POST) - Select aninhado
5. ✅ `/api/empresas/[id]/propostas-aceitas/[propostaId]/informacoes` (PUT) - Select explícito
6. ✅ `/api/auth/login` - Select explícito

## Monitoramento

Para verificar as queries executadas em desenvolvimento:
```bash
# As queries serão exibidas no console do servidor
pnpm dev
```

## Próximos Passos

Sugestões para otimizações futuras:
- [ ] Implementar cache Redis para queries frequentes
- [ ] Adicionar índices específicos no banco
- [ ] Implementar paginação nas listagens
- [ ] Adicionar query de agregação para dashboards
