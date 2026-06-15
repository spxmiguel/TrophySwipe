# TrophySwipe

TrophySwipe e um app React para recomendar jogos para jogar e platinar usando dados reais das contas conectadas do usuario. Ele foi preparado para GitHub Pages, Firebase Auth, Firestore e funcionamento offline-first com LocalStorage.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Firebase Auth com Google
- Firestore para sync na nuvem
- LocalStorage como cache offline e fallback
- GitHub Pages via GitHub Actions

## O que o app faz

- Landing page gamer premium com Steam, Xbox, PSN e Switch.
- Login com Google ou modo local sem conta.
- Dashboard com perfil, contas conectadas, jogos importados, recomendacoes e progresso de platina.
- Providers separados para Steam, Xbox, PSN, Switch e Epic.
- Biblioteca unificada com deteccao de duplicados por titulo normalizado.
- Swipe com decisoes: ignorar, talvez, quero jogar e quero platinar.
- Modo Platina com provider separado de guias.
- Configuracoes para sync, export/import JSON, limpar local, apagar nuvem e tema.

O projeto nao usa dados fake para preencher tela. Sem provider configurado, o app mostra estados vazios e instrucoes de configuracao.

## Como rodar localmente

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Configurar Firebase

1. Crie um projeto no Firebase Console.
2. Ative Authentication > Sign-in method > Google.
3. Crie um app Web em Project settings.
4. Copie `.env.example` para `.env.local`.
5. Preencha as variaveis:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_BASE_PATH=/TrophySwipe/
```

Tambem existe `src/firebase/firebaseConfig.example.ts` como referencia para quem preferir configurar manualmente. O arquivo real `src/firebase/firebaseConfig.ts` fica ignorado no Git para evitar publicar credenciais por engano.

Neste setup inicial foi criado o projeto Firebase `trophyswipe-spx`, com Web App registrado, Firestore criado em `nam5`, Google Sign-In ativo e `spxmiguel.github.io` autorizado para login no GitHub Pages. O arquivo local `.env.local` foi preenchido na maquina, mas nao e versionado.

### Firestore

O app salva o estado em:

```text
users/{uid}/trophyswipe/state
```

Regras minimas:

```bash
firebase deploy --only firestore:rules
```

As regras estao em `firestore.rules` e permitem leitura/escrita apenas pelo proprio usuario autenticado.

## Offline-first e sync

O TrophySwipe sempre salva primeiro no LocalStorage. Quando o usuario esta logado, online e com Firebase configurado, o estado local e o estado remoto sao mesclados e gravados no Firestore.

Se o usuario estiver offline, as alteracoes continuam locais. Ao voltar online ou fazer login, o app tenta sincronizar automaticamente.

## Providers reais

### Steam

`src/providers/steamProvider.ts` suporta:

- SteamID64.
- Steam Web API key para uso pessoal/teste.
- Bridge/API propria para producao, sem expor segredo no cliente.

Observacao: chamadas diretas para Steam podem falhar por CORS em navegadores. Para deploy real no GitHub Pages, use um bridge.

### Xbox, PSN e Switch

`xboxProvider`, `psnProvider` e `switchProvider` usam `bridgeBaseUrl` e token opcional. Eles esperam um endpoint autenticado que retorne biblioteca real do usuario.

Formato aceito pelo bridge:

```json
{
  "games": [
    {
      "id": "id-real",
      "title": "Nome real vindo da API",
      "playtimeMinutes": 120,
      "achievementsEarned": 4,
      "achievementsTotal": 40,
      "subscriptionSource": "game_pass"
    }
  ]
}
```

Sem bridge/API configurado, o app mostra erro claro e nao cria jogos ficticios.

### Guias de platina

`src/providers/trophyGuideProvider.ts` aceita uma API configurada em Configuracoes. Fontes futuras podem incluir PSNProfiles, PowerPyx, TrueAchievements, Steam Guides e HowLongToBeat, desde que usadas por meios permitidos. O app nao faz scraping ilegal. Sem fonte configurada, mostra "guia indisponivel" com o motivo.

## GitHub Pages

O projeto usa `HashRouter`, entao funciona bem em GitHub Pages sem regras de rewrite.

Para deploy automatico:

1. Publique o repositorio no GitHub.
2. Em Settings > Pages, selecione GitHub Actions.
3. Cadastre os secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Faça push na branch `main`.

Para deploy manual com `gh-pages`:

```bash
npm run deploy
```

## Estrutura

```text
src/
  components/
  pages/
  providers/
  services/
  hooks/
  utils/
  types/
  data/
  firebase/
```

## Scripts

- `npm run dev`: servidor local.
- `npm run build`: typecheck + build Vite.
- `npm run preview`: preview do build.
- `npm run lint`: ESLint.
- `npm run deploy`: build + push do `dist` para branch `gh-pages`.
