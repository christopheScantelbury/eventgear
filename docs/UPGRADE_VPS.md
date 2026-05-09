# Upgrade da VPS (Opção 2)

> Diagnóstico: a VPS atual (Hostinger, IP `31.97.162.185`) está saturada.
> Múltiplos projetos rodando (`eventgear`, `nota-mei-gateway`, `agenda-inteligente`)
> + builds simultâneos no Easypanel travam o `npm install`. RAM/CPU são o gargalo.

## Como saber se preciso de upgrade

SSH na VPS e rodar:

```bash
# RAM
free -h

# CPU
nproc
top -bn1 | head -20

# Disco
df -h

# Processos consumindo recursos
ps aux --sort=-%mem | head -10
```

Sintomas de VPS pequena:
- `npm install` no Easypanel demora >15 min ou trava
- Builds com status "warning" (laranja) que nunca completam
- Containers caem com OOM (Out of Memory)
- Disk pressure (`df -h` mostrando >90%)

## Plano recomendado

Para 3 projetos com NestJS + Next.js + Postgres + Redis + MinIO:

| Recurso | Atual provável | Recomendado |
|---|---|---|
| RAM | 2-4 GB | **8 GB** mínimo |
| CPU | 1-2 vCPU | **2-4 vCPU** |
| Disco | 50-80 GB | **100 GB** SSD |

## Passo a passo Hostinger

1. https://hpanel.hostinger.com/ → VPS
2. Selecione a VPS `srv31.97.162.185` (ou similar)
3. Botão **Upgrade Plan**
4. Escolha plano com 8 GB RAM e 2-4 vCPUs (em geral KVM 4 ou KVM 8)
5. Confirmar — a Hostinger faz upgrade **sem downtime** (live migration na maioria dos casos)
6. Aguardar email de confirmação (~5 min)
7. Validar pelo SSH: `free -h` deve mostrar RAM nova

## Outros provedores (se for outro)

| Provedor | Caminho |
|---|---|
| DigitalOcean | Droplet → Resize → Choose new plan |
| AWS | EC2 → Stop instance → Change instance type |
| Vultr | Server → Settings → Plan |
| Linode | Resize → Choose new plan |

A maioria requer **stop/start** do servidor (~2-5 min de downtime).

## Após o upgrade

1. Confirmar via SSH: `free -h`, `nproc`, `df -h`
2. Restart do Easypanel daemon (opcional): `systemctl restart easypanel`
3. Tentar um deploy normal (Easypanel → Implantar) — deve passar
4. (Opcional) Manter o workflow GHA → GHCR como redundância

## Dica: separar VPS por projeto

Para escalar sem dor:
- VPS 1: `nota-mei-gateway` (já no Railway, pode mover)
- VPS 2: `eventgear` (atual)
- VPS 3: `agenda-inteligente` (atual)

Hostinger custa ~$5-15/mês por VPS pequena. Com 2 VPSs separadas,
cada projeto tem builds independentes e não trava o outro.
