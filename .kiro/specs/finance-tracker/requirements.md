# Requirements Document

## Introduction

Aplikacja Finance Tracker służy do śledzenia wyników finansowych z transakcji kupna i sprzedaży. Aplikacja działa wyłącznie po stronie frontendu z lokalnym przechowywaniem danych (localStorage). Administrator zarządza transakcjami, a użytkownicy publiczni mogą przeglądać statystyki i wyniki. W przyszłości planowane jest dodanie backendu.

**Założenia projektowe dotyczące skalowalności:**
- Architektura aplikacji powinna umożliwiać łatwe zastąpienie localStorage warstwą API (backend) bez konieczności przepisywania logiki biznesowej
- Warstwa dostępu do danych powinna być wydzielona i abstrakcyjna, aby ułatwić przyszłą migrację
- Struktura kodu powinna być modularna, umożliwiając dodawanie nowych funkcji bez modyfikacji istniejących komponentów

## Glossary

- **Aplikacja**: Frontendowa aplikacja Finance Tracker do śledzenia wyników finansowych
- **Administrator**: Jedyny użytkownik z kontem administracyjnym, zarządzający transakcjami
- **Użytkownik_Publiczny**: Osoba odwiedzająca aplikację bez uprawnień administracyjnych, mogąca jedynie przeglądać dane
- **Transakcja**: Rekord operacji finansowej zawierający dane o kupnie i/lub sprzedaży
- **Portfel**: Wirtualne saldo środków, powiększane po każdej sprzedaży
- **Dashboard**: Panel główny z podsumowaniem statystyk i wyników finansowych
- **Magazyn_Lokalny**: Mechanizm przechowywania danych w przeglądarce (localStorage)
- **Mapa_Cieplna**: Wizualizacja wyników w formie mapy cieplnej pogrupowanej miesięcznie

## Requirements

### Wymaganie 1: Uwierzytelnianie administratora

**Historia użytkownika:** Jako administrator, chcę się zalogować do aplikacji, aby zarządzać transakcjami i danymi finansowymi.

#### Kryteria akceptacji

1. WHEN Administrator wprowadzi poprawny login i hasło w formularzu logowania, THE Aplikacja SHALL uwierzytelnić Administratora, zapisać flagę sesji w Magazynie_Lokalnym i wyświetlić panel administracyjny
2. WHEN Administrator wprowadzi niepoprawny login lub hasło, THE Aplikacja SHALL wyświetlić ogólny komunikat o błędzie logowania bez wskazywania, które pole jest nieprawidłowe
3. WHEN Administrator kliknie przycisk wylogowania, THE Aplikacja SHALL usunąć flagę sesji z Magazynu_Lokalnego i przekierować do widoku publicznego
4. THE Aplikacja SHALL przechowywać dane uwierzytelniające Administratora w Magazynie_Lokalnym w formie zahashowanej
5. IF nieuwierzytelniony użytkownik próbuje uzyskać dostęp do panelu administracyjnego, THEN THE Aplikacja SHALL przekierować użytkownika do formularza logowania
6. WHEN Aplikacja zostanie uruchomiona lub odświeżona, THE Aplikacja SHALL sprawdzić flagę sesji w Magazynie_Lokalnym i przywrócić stan uwierzytelnienia Administratora jeśli flaga jest obecna

### Wymaganie 2: Zarządzanie transakcjami

**Historia użytkownika:** Jako administrator, chcę dodawać, edytować i usuwać transakcje, aby śledzić moje operacje finansowe.

#### Kryteria akceptacji

1. WHEN Administrator wypełni formularz nowej transakcji i wszystkie wymagane pola przejdą walidację, THE Aplikacja SHALL zapisać transakcję w Magazynie_Lokalnym z automatycznie wygenerowanym unikalnym numerem transakcji
2. THE Aplikacja SHALL wymagać podania następujących pól dla każdej transakcji: numer transakcji (generowany automatycznie), tytuł (maksymalnie 100 znaków), kategoria (maksymalnie 50 znaków), status (Kupiono/Sprzedano), cena zakupu (wartość liczbowa od 0.01 do 999 999 999.99), data zakupu
3. THE Aplikacja SHALL traktować pole opisu jako opcjonalne przy tworzeniu transakcji, z maksymalną długością 500 znaków
4. WHEN Administrator zmieni status transakcji na "Sprzedano", THE Aplikacja SHALL wymagać podania ceny sprzedaży (wartość liczbowa od 0.01 do 999 999 999.99) i daty sprzedaży nie wcześniejszej niż data zakupu
5. WHEN transakcja posiada cenę zakupu i cenę sprzedaży, THE Aplikacja SHALL automatycznie obliczyć zysk procentowy jako ((cena_sprzedaży - cena_zakupu) / cena_zakupu) * 100, zaokrąglony do dwóch miejsc po przecinku
6. WHEN transakcja posiada cenę zakupu i cenę sprzedaży, THE Aplikacja SHALL automatycznie obliczyć zysk kwotowy jako cena_sprzedaży - cena_zakupu
7. WHEN transakcja posiada datę zakupu i datę sprzedaży, THE Aplikacja SHALL automatycznie obliczyć liczbę dni od zakupu do sprzedaży jako różnicę dat kalendarzowych
8. WHEN Administrator edytuje istniejącą transakcję, THE Aplikacja SHALL zaktualizować rekord w Magazynie_Lokalnym i przeliczyć zysk procentowy, zysk kwotowy oraz liczbę dni
9. WHEN Administrator usunie transakcję, THE Aplikacja SHALL usunąć rekord z Magazynu_Lokalnego po potwierdzeniu operacji przez Administratora w oknie dialogowym
10. IF Administrator zatwierdzi formularz transakcji z brakującymi lub nieprawidłowymi danymi w polach wymaganych, THEN THE Aplikacja SHALL wyświetlić komunikat walidacyjny przy każdym nieprawidłowym polu i nie zapisać transakcji
11. IF Administrator wprowadzi datę sprzedaży wcześniejszą niż data zakupu, THEN THE Aplikacja SHALL wyświetlić komunikat walidacyjny informujący o nieprawidłowej dacie i nie zapisać zmian

### Wymaganie 3: Portfel

**Historia użytkownika:** Jako administrator, chcę widzieć aktualne saldo portfela, aby znać dostępne środki po sprzedażach.

#### Kryteria akceptacji

1. WHEN transakcja zostanie oznaczona jako "Sprzedano", THE Aplikacja SHALL dodać kwotę zysku (cena_sprzedaży - cena_zakupu) do salda Portfela i zapisać zaktualizowane saldo w Magazynie_Lokalnym
2. WHEN transakcja ze statusem "Sprzedano" zostanie usunięta, THE Aplikacja SHALL odjąć kwotę zysku tej transakcji (cena_sprzedaży - cena_zakupu) od salda Portfela i zapisać zaktualizowane saldo w Magazynie_Lokalnym
3. WHEN Administrator zmieni cenę zakupu lub cenę sprzedaży w transakcji ze statusem "Sprzedano", THE Aplikacja SHALL przeliczyć saldo Portfela, odejmując poprzednią kwotę zysku i dodając nową kwotę zysku
4. THE Aplikacja SHALL wyświetlać aktualne saldo Portfela w panelu administracyjnym jako wartość liczbową z dokładnością do 2 miejsc po przecinku
5. IF saldo Portfela jest wartością ujemną, THEN THE Aplikacja SHALL wyświetlać saldo z oznaczeniem wizualnym wskazującym stratę

### Wymaganie 4: Dashboard - panel statystyk

**Historia użytkownika:** Jako administrator, chcę widzieć podsumowanie moich wyników finansowych na dashboardzie, aby szybko ocenić efektywność moich transakcji.

#### Kryteria akceptacji

1. THE Dashboard SHALL wyświetlać łączną liczbę wszystkich transakcji (zarówno zakończonych jak i niezakończonych)
2. THE Dashboard SHALL wyświetlać średni zysk procentowy ze wszystkich zakończonych transakcji, zaokrąglony do 2 miejsc po przecinku
3. THE Dashboard SHALL wyświetlać średni czas sprzedaży w dniach ze wszystkich zakończonych transakcji, zaokrąglony do pełnych dni
4. THE Dashboard SHALL wyświetlać najlepszą transakcję (najwyższy zysk procentowy) z jej tytułem i wartością zysku procentowego
5. THE Dashboard SHALL wyświetlać najgorszą transakcję (najniższy zysk procentowy) z jej tytułem i wartością zysku procentowego
6. THE Dashboard SHALL wyświetlać łączny zysk kwotowy ze wszystkich zakończonych transakcji jako sumę zysków kwotowych poszczególnych transakcji
7. THE Dashboard SHALL wyświetlać łączny zysk procentowy ze wszystkich zakończonych transakcji obliczony jako ((suma cen sprzedaży - suma cen zakupu) / suma cen zakupu) * 100, zaokrąglony do 2 miejsc po przecinku
8. THE Dashboard SHALL wyświetlać Mapę_Cieplną z zyskiem kwotowym pogrupowanym miesięcznie według daty sprzedaży
9. IF brak zakończonych transakcji, THEN THE Dashboard SHALL wyświetlać komunikat informujący o braku danych do wyświetlenia zamiast statystyk z kryteriów 2-8
10. IF wiele transakcji posiada identyczny najwyższy lub najniższy zysk procentowy, THEN THE Dashboard SHALL wyświetlać transakcję z najnowszą datą sprzedaży

### Wymaganie 5: Widok publiczny

**Historia użytkownika:** Jako użytkownik publiczny, chcę przeglądać statystyki i wyniki finansowe, aby ocenić skuteczność inwestycji.

#### Kryteria akceptacji

1. THE Aplikacja SHALL wyświetlać widok publiczny jako domyślny widok aplikacji, dostępny bez wymogu logowania
2. THE Aplikacja SHALL wyświetlać Użytkownikowi_Publicznemu statystyki finansowe: łączną liczbę transakcji, średni zysk procentowy, średni czas sprzedaży w dniach oraz łączny zysk kwotowy
3. THE Aplikacja SHALL wyświetlać Użytkownikowi_Publicznemu listę zakończonych transakcji zawierającą dla każdej transakcji: tytuł, kategorię, zysk procentowy, zysk kwotowy oraz liczbę dni od zakupu do sprzedaży
4. THE Aplikacja SHALL wyświetlać Użytkownikowi_Publicznemu Mapę_Cieplną z wynikami miesięcznymi
5. THE Aplikacja SHALL wyświetlać Użytkownikowi_Publicznemu sekcję "O mnie"
6. THE Aplikacja SHALL nie renderować w widoku publicznym elementów interfejsu umożliwiających edycję, dodawanie i usuwanie transakcji
7. IF brak zakończonych transakcji, THEN THE Aplikacja SHALL wyświetlać w widoku publicznym komunikat informujący o braku danych do wyświetlenia zamiast pustej listy i statystyk

### Wymaganie 6: Sekcja "O mnie"

**Historia użytkownika:** Jako administrator, chcę zarządzać sekcją "O mnie", aby przedstawić się odwiedzającym i opisać moją działalność.

#### Kryteria akceptacji

1. THE Aplikacja SHALL wyświetlać w sekcji "O mnie" pole tekstowe z opisem działalności i informacjami o Administratorze, o maksymalnej długości 2000 znaków
2. WHERE Administrator skonfigurował linki do mediów społecznościowych, THE Aplikacja SHALL wyświetlać maksymalnie 10 linków do mediów społecznościowych w sekcji "O mnie" jako klikalne odnośniki otwierające się w nowej karcie
3. WHEN Administrator kliknie przycisk zapisu w sekcji "O mnie", THE Aplikacja SHALL zapisać zmiany w Magazynie_Lokalnym i wyświetlić potwierdzenie zapisu
4. IF Administrator wprowadzi link do mediów społecznościowych w niepoprawnym formacie URL, THEN THE Aplikacja SHALL wyświetlić komunikat o błędzie walidacji i uniemożliwić zapis do momentu poprawienia linku
5. IF sekcja "O mnie" nie zawiera jeszcze żadnych danych, THEN THE Aplikacja SHALL wyświetlić komunikat informujący o braku treści oraz przycisk edycji widoczny dla Administratora

### Wymaganie 7: Lokalne przechowywanie danych

**Historia użytkownika:** Jako administrator, chcę aby dane były przechowywane lokalnie w przeglądarce, aby aplikacja działała bez backendu.

#### Kryteria akceptacji

1. THE Aplikacja SHALL przechowywać wszystkie dane transakcji w Magazynie_Lokalnym przeglądarki w formacie JSON z wydzieloną warstwą dostępu do danych (repozytorium)
2. THE Aplikacja SHALL przechowywać dane sekcji "O mnie" w Magazynie_Lokalnym przeglądarki pod dedykowanym kluczem
3. THE Aplikacja SHALL przechowywać saldo Portfela w Magazynie_Lokalnym przeglądarki
4. WHEN Aplikacja zostanie uruchomiona, THE Aplikacja SHALL wczytać wszystkie dane z Magazynu_Lokalnego poprzez warstwę repozytorium
5. IF Magazyn_Lokalny jest niedostępny lub pusty, THEN THE Aplikacja SHALL zainicjalizować domyślny stan z pustą listą transakcji i zerowym saldem Portfela
6. IF dane w Magazynie_Lokalnym są uszkodzone lub mają nieprawidłowy format, THEN THE Aplikacja SHALL zainicjalizować domyślny stan i wyświetlić komunikat o utracie danych
7. THE Aplikacja SHALL implementować warstwę dostępu do danych jako abstrakcję umożliwiającą przyszłą zamianę localStorage na API backendowe bez modyfikacji logiki biznesowej

### Wymaganie 8: Kategorie transakcji

**Historia użytkownika:** Jako administrator, chcę ręcznie wprowadzać kategorie transakcji, aby organizować moje operacje finansowe.

#### Kryteria akceptacji

1. WHEN Administrator tworzy lub edytuje transakcję, THE Aplikacja SHALL wyświetlić pole tekstowe umożliwiające ręczne wpisanie nazwy kategorii o długości od 1 do 50 znaków
2. WHEN Administrator zapisuje transakcję z nową nazwą kategorii, THE Aplikacja SHALL zapisać tę kategorię na liście wcześniej użytych kategorii w Magazynie_Lokalnym, przechowując maksymalnie 100 unikalnych kategorii z porównaniem bez rozróżniania wielkości liter
3. WHEN Administrator wpisuje co najmniej 1 znak w polu kategorii, THE Aplikacja SHALL wyświetlić maksymalnie 5 podpowiedzi z wcześniej użytych kategorii, których nazwa zawiera wpisany tekst bez rozróżniania wielkości liter
4. IF Administrator pozostawi pole kategorii puste podczas zapisu transakcji, THEN THE Aplikacja SHALL zapisać transakcję bez przypisanej kategorii

### Wymaganie 9: Mapa cieplna miesięczna

**Historia użytkownika:** Jako użytkownik, chcę widzieć mapę cieplną wyników miesięcznych, aby wizualnie ocenić trendy w czasie.

#### Kryteria akceptacji

1. THE Mapa_Cieplna SHALL grupować zakończone transakcje według miesiąca sprzedaży i wyświetlać komórki dla każdego miesiąca w zakresie od miesiąca pierwszej do miesiąca ostatniej zakończonej transakcji
2. THE Mapa_Cieplna SHALL wizualizować sumę zysku kwotowego wszystkich zakończonych transakcji w danym miesiącu za pomocą skali kolorów, gdzie intensywność koloru jest proporcjonalna do wartości bezwzględnej zysku względem maksymalnej wartości bezwzględnej zysku spośród wszystkich wyświetlanych miesięcy
3. THE Mapa_Cieplna SHALL używać koloru zielonego o intensywności proporcjonalnej do wartości zysku dla miesięcy z zyskiem większym niż zero
4. THE Mapa_Cieplna SHALL używać koloru czerwonego o intensywności proporcjonalnej do wartości bezwzględnej straty dla miesięcy ze stratą (zysk mniejszy niż zero)
5. THE Mapa_Cieplna SHALL używać koloru neutralnego (bez nasycenia zielonego ani czerwonego) dla miesięcy z zyskiem równym zero
6. WHEN Użytkownik_Publiczny lub Administrator najedzie kursorem na komórkę miesiąca, THE Mapa_Cieplna SHALL wyświetlić tooltip z dokładną kwotą zysku (w formacie walutowym) i liczbą zakończonych transakcji w danym miesiącu
7. IF brak zakończonych transakcji, THEN THE Mapa_Cieplna SHALL wyświetlać komunikat informujący o braku danych do wizualizacji
