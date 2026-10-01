---
title: Čo je php-terminal-cms
category: about
date: 2026-09-07
---

# Čo je php-terminal-cms

Publikačná platforma pre ľudí, ktorí už majú textový editor, terminál a server.

## Inštalácia

```console
$ tree -L 2 php-terminal-cms
```

```output
php-terminal-cms
|-- editor/          index.html
|-- site/
|   |-- content/     jeden markdown = jeden dokument (stránka)
|   |-- public/      hlavný adresár webu (webserver root)
|   |-- src/         PHP kód webu, ~2 200 riadkov
|   `-- site.php     konfigurácia systému
|-- shared/          jedna kópia témy a tabuľky jazykov
`-- bin/             build, test, fmt, package
```

Dve komponenty, jeden repozitár. Editor je statická HTML stránka; server je PHP skript, ktorý číta a interpretuje markdown súbory. Nič sa negeneruje dopredu a nič sa necachuje — stránka sa vykreslí zo svojho markdown súboru pri každej požiadavke.

## Požiadavky

- PHP 8.1 alebo novšie, bez rozšírení nad rámec predvolených
- adresár, z ktorého vie webový server obsluhovať klientov
- prehliadač

## Čo odmieta robiť

- **Nezapisuje súbory.** Verejná komponenta (site) iba otvára súbory na čítanie a nič iné.
- **Nečíta požiadavku.** Žiadne `$_GET`, žiadne `$_POST`, žiadna cookie, žiadna session.
- **Nespúšťa cudzí kód.** Serverová časť (site) nemá závislosti. Systém je závislý iba na jednej javascript knižnici (Mermaid), ktorá beží v prehliadači čitateľa (editor) a načítava sa iba v prípade, keď stránka obsahuje Mermaid diagram.

> Bezpečnostný model nie je zoznam opatrení. Je to zoznam vecí, ktoré chýbajú, a čo chýba, sa nedá zneužiť.
