# Genshin Up

Genshin Up e um planejador de ascensão para Genshin Impact. Selecione personagens e armas, defina metas, informe o inventário e veja quais materiais faltam.

Web: https://genshin-calculatorcharacters.web.app/

## Executar localmente

```powershell
npm install
npx live-server public
```

O comando abre o site no navegador e recarrega a pagina automaticamente quando arquivos em `public/` mudam.

## Como usar

1. Pesquise e selecione um personagem.
2. Defina niveis, talentos e arma.
3. Calcule os materiais e informe o inventario.
4. Exporte um backup JSON antes de trocar de navegador ou dispositivo.

## Seus dados

Os dados ficam somente no `localStorage` do navegador. Eles so sao removidos ao limpar os dados do site ou usar o botao de limpeza. Use exportar/importar para transferir ou guardar um backup.

## Estrutura

```text
public/     site estatico
  index.html
  styles/main.css
  scripts/app.js
tools/      utilitarios locais e atualizacao de icones
```