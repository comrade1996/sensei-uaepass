# Angular Compatibility

| Sensei UAE PASS | Angular | RxJS | Node.js |
| --- | --- | --- | --- |
| 2.x | 19.2–20.x | 7.8.x | 22.12+, 24.x |
| 1.x | 19.x | 7.8.x | Versions supported by Angular 19 |

The package uses Angular partial compilation and declares Angular as a peer dependency. Applications must install compatible `@angular/core` and `@angular/common` versions.

CI validates the workspace on Node.js 22.12 and 24. Before upgrading Angular, verify the package peer range and run the application's complete test suite.
