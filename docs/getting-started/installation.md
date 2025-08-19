# Installation

Install the library from npm:

```bash
npm install sensei-uaepass
```

Peer dependencies:
- `@angular/core`, `@angular/common`, `@angular/router` (v19+)
- `rxjs`

Enable HttpClient in your app providers:

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient(withFetch())]
};
```

Next: [Quickstart](quickstart.md)
