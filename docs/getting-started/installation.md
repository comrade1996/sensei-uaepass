# Installation

Install the library from npm:

```bash
npm install sensei-uaepass
```

Peer dependencies:

- `@angular/core` and `@angular/common` versions `>=19.2.0 <21.0.0`
- `rxjs` version 7.8

Enable HttpClient in your app providers:

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient(withFetch())]
};
```

Next: [Quickstart](quickstart.md)
