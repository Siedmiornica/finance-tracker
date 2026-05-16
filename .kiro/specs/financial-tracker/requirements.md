# Requirements Document

## Introduction

Prosta aplikacja webowa do śledzenia transakcji finansowych (kupno/sprzedaż przedmiotów). Aplikacja umożliwia rejestrowanie pozycji z ceną zakupu i sprzedaży, obliczanie zysku/straty, organizowanie pozycji w foldery/kategorie oraz udostępnianie portfolio publicznie w trybie tylko do odczytu. Aplikacja jest przeznaczona do użytku osobistego — minimalna, tania w utrzymaniu i prosta w implementacji.

## Glossary

- **App**: Aplikacja webowa do śledzenia transakcji finansowych
- **Owner**: Zalogowany użytkownik, jedyny właściciel aplikacji, który może dodawać i edytować dane
- **Viewer**: Niezalogowany użytkownik przeglądający publiczne portfolio w trybie tylko do odczytu
- **Item**: Pojedyncza pozycja transakcyjna (kupiony/sprzedany przedmiot)
- **Active_Item**: Pozycja ze statusem "aktywna" — kupiona, ale jeszcze niesprzedana
- **Sold_Item**: Pozycja ze statusem "sprzedana" — z uzupełnioną ceną i datą sprzedaży
- **Folder**: Kategoria/folder tworzony dynamicznie przez Owner do grupowania pozycji
- **Portfolio**: Publiczny widok wszystkich pozycji i podsumowań, dostępny dla każdego z linkiem
- **Profit**: Różnica między ceną sprzedaży a ceną zakupu (kwotowo i procentowo)

## Requirements

### Requirement 1: Dodawanie pozycji

**User Story:** Jako Owner, chcę dodawać nowe pozycje transakcyjne, aby rejestrować moje zakupy.

#### Acceptance Criteria

1. WHEN Owner submits a new item form with valid purchase price, purchase date, and description, THE App SHALL create an Item with those values and assign the status "active" to that Item
2. THE App SHALL require purchase price (numeric value between 0.01 and 9,999,999.99), purchase date (valid calendar date not in the future), and description (between 1 and 500 characters) for every new Item
3. IF Owner submits an item form with missing required fields, THEN THE App SHALL display a validation error indicating which fields are missing without clearing the already filled fields
4. IF Owner submits an item form with invalid field values (non-numeric purchase price, purchase price outside allowed range, future purchase date, or description exceeding 500 characters), THEN THE App SHALL display a validation error indicating which fields are invalid and why
5. WHEN the App successfully creates an Item, THE App SHALL display a confirmation message and show the newly created Item in the item list

### Requirement 2: Sprzedaż pozycji

**User Story:** Jako Owner, chcę rejestrować sprzedaż pozycji, aby śledzić wyniki moich transakcji.

#### Acceptance Criteria

1. WHEN Owner submits both a sale price and a sale date for an Active_Item, THE App SHALL change the Item status to "sold"
2. IF Owner submits a sale price without a sale date or a sale date without a sale price, THEN THE App SHALL display a validation error indicating that both sale price and sale date are required
3. WHEN an Item status changes to "sold", THE App SHALL calculate Profit as the difference between sale price and purchase price
4. WHEN an Item status changes to "sold" and purchase price is greater than zero, THE App SHALL calculate Profit percentage as ((sale price - purchase price) / purchase price) * 100, rounded to 2 decimal places
5. IF an Item status changes to "sold" and purchase price equals zero, THEN THE App SHALL display Profit percentage as "N/A"
6. IF Owner enters a sale price less than 0.01, THEN THE App SHALL display a validation error indicating that sale price must be at least 0.01
7. THE App SHALL display Profit for each Sold_Item in both absolute amount and percentage

### Requirement 3: Statusy pozycji

**User Story:** Jako Owner, chcę widzieć status każdej pozycji, aby wiedzieć które są aktywne a które sprzedane.

#### Acceptance Criteria

1. THE App SHALL assign exactly one status to each Item: "active" or "sold"
2. IF an Item has no sale price and no sale date, THEN THE App SHALL display the Item with status "active"
3. IF an Item has both a sale price and a sale date, THEN THE App SHALL display the Item with status "sold"
4. IF an Item has a sale price but no sale date, or a sale date but no sale price, THEN THE App SHALL treat the Item as "active" and display a visual indicator that sale data is incomplete

### Requirement 4: Foldery/Kategorie

**User Story:** Jako Owner, chcę tworzyć foldery i przypisywać do nich pozycje, aby organizować moje transakcje.

#### Acceptance Criteria

1. WHEN Owner creates a new folder with a unique name (case-insensitive comparison, between 1 and 50 characters in length), THE App SHALL add the folder to the list of available folders
2. WHEN Owner assigns an Item to a Folder, THE App SHALL associate that Item with the selected Folder, replacing any previous Folder assignment for that Item
3. THE App SHALL allow each Item to be assigned to at most one Folder
4. THE App SHALL allow Items to exist without any Folder assignment
5. WHEN Owner deletes a Folder, THE App SHALL remove the folder assignment from all Items in that Folder without deleting the Items
6. IF Owner attempts to create a Folder with a name that already exists (case-insensitive), THEN THE App SHALL reject the creation and display a validation error indicating the name is already in use

### Requirement 5: Podsumowanie ogólne

**User Story:** Jako Owner, chcę widzieć ogólne podsumowanie moich transakcji, aby ocenić wyniki finansowe.

#### Acceptance Criteria

1. THE App SHALL display total Profit as the sum of all Sold_Item profits in absolute amount
2. THE App SHALL display total value of active positions as the sum of purchase prices of all Active_Items
3. WHEN an Item status changes, is deleted, or has its purchase price or sale price edited, THE App SHALL recalculate the summary values within 1 second
4. IF there are no Sold_Items, THEN THE App SHALL display total Profit as 0
5. IF there are no Active_Items, THEN THE App SHALL display total value of active positions as 0

### Requirement 6: Publiczne portfolio

**User Story:** Jako Owner, chcę udostępnić moje portfolio publicznie, aby inni mogli przeglądać moje wyniki.

#### Acceptance Criteria

1. THE App SHALL provide a permanent public URL for the Portfolio view that does not require authentication to access
2. WHEN a Viewer accesses the public Portfolio URL, THE App SHALL display all Items (with their purchase price, purchase date, description, sale price, sale date, status, and Profit), all Folders, and summary data (total Profit and total value of active positions) in read-only mode
3. WHILE a Viewer is accessing the Portfolio, THE App SHALL hide all edit, add, and delete controls
4. WHEN the Owner modifies any data, THE App SHALL reflect those changes in the public Portfolio on the next Viewer page load
5. IF a Viewer accesses the public Portfolio URL and no Items exist, THEN THE App SHALL display the Portfolio page with empty item list and summary values of zero

### Requirement 7: Logowanie i autoryzacja

**User Story:** Jako Owner, chcę się logować do aplikacji, aby tylko ja mógł dodawać i edytować dane.

#### Acceptance Criteria

1. WHEN Owner provides valid credentials (username and password), THE App SHALL authenticate the Owner and grant access to add, edit, and delete operations for the duration of the session
2. WHILE a user is not authenticated, THE App SHALL restrict access to read-only Portfolio view and hide all add, edit, and delete controls
3. IF an unauthenticated user attempts to modify data, THEN THE App SHALL reject the request and display an access denied message without revealing whether the Owner account exists
4. THE App SHALL support exactly one Owner account
5. IF Owner provides invalid credentials, THEN THE App SHALL reject the login attempt and display an error message indicating that the credentials are incorrect
6. WHEN Owner triggers logout, THE App SHALL terminate the session and redirect to the read-only Portfolio view
7. IF an authenticated session is inactive for more than 30 minutes, THEN THE App SHALL terminate the session and require re-authentication

### Requirement 8: Edycja i usuwanie pozycji

**User Story:** Jako Owner, chcę edytować i usuwać pozycje, aby korygować błędy w danych.

#### Acceptance Criteria

1. WHEN Owner submits an edited Item, THE App SHALL validate that purchase price, purchase date, and description remain present, and update the Item with the new values
2. WHEN Owner deletes an Item, THE App SHALL remove the Item from the system permanently and recalculate summary values
3. IF Owner edits a Sold_Item sale price or purchase price, THEN THE App SHALL recalculate the Profit for that Item as the difference between sale price and purchase price in both absolute amount and percentage
4. IF Owner removes the sale price or sale date from a Sold_Item, THEN THE App SHALL change the Item status to "active" and remove the Profit value for that Item
5. IF Owner submits an edited Item with missing required fields, THEN THE App SHALL display a validation error indicating which fields are missing and preserve the previous values
