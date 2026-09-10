---
title: Čo je php-terminal-cms
category: about
date: 2026-09-07
---

# Čo je php-terminal-cms

Publikačná platforma pre ľudí, ktorí už majú textový editor, terminál a server, a nechcú medzi sebou a zverejnenou stránkou štvrtú vec.

## Ako vyzerá inštalácia

```console
$ tree -L 2 php-terminal-cms
```

```output
php-terminal-cms
|-- editor/          písacia plocha — otvorte index.html z disku
|-- site/
|   |-- content/     váš markdown, jeden súbor na dokument
|   |-- public/      jediné, na čo mieri webový server
|   |-- src/         renderer, ~300 riadkov PHP
|   `-- site.php     názov, podnadpis, kategórie, výpisy, pätička
|-- shared/          jedna kópia témy a tabuľky jazykov
`-- bin/             build, test, fmt, package
```

Dve polovice, jeden repozitár. Editor je statická stránka; server je PHP skript, ktorý číta súbory. Nič sa negeneruje dopredu a nič sa necachuje — stránka sa vykreslí zo svojho markdown súboru pri každej požiadavke, čo trvá približne milisekundu, pretože nie je čo iné robiť.

## Požiadavky, celé

- PHP 8.1 alebo novšie, bez rozšírení nad rámec predvolených
- adresár, ktorý vie webový server obslúžiť
- prehliadač, pre editor

Štvrtá požiadavka neexistuje. Žiadne composer install, žiadny node, žiadny build.

## Čo odmieta robiť

- **Nezapisuje súbory.** Verejná polovica otvára súbory na čítanie a nič iné; `bin/test` zhodí build, ak sa v `site/src/` objaví `file_put_contents`, `unlink` alebo `fwrite`.
- **Nečíta požiadavku.** Žiadne `$_GET`, žiadne `$_POST`, žiadna cookie, žiadna session. URL vyberá kategóriu a slug porovnaním s menami na disku, nikdy sa nemení na cestu.
- **Nespúšťa cudzí kód.** Žiadna závislosť znamená žiadnu závislosť, ktorú treba aktualizovať o tretej ráno.

> Bezpečnostný model nie je zoznam opatrení. Je to zoznam vecí, ktoré chýbajú, a čo chýba, sa nedá zneužiť.
