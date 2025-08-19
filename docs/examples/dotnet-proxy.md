# ASP.NET Core Proxy (.NET)

A simple ASP.NET Core 8 minimal API proxy to handle UAE PASS token exchange and user info.

## Why a proxy?

- Keeps `client_secret` off the browser
- Avoids CORS issues when calling UAE PASS endpoints

## Endpoints

- `POST /api/uae-pass/token` — Exchanges `code` for tokens
- `POST /api/uae-pass/userinfo` — Returns user profile using an access token

## Program.cs (minimal example)

```csharp
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Config from environment or appsettings.json
// UAEPASS_CLIENT_ID, UAEPASS_CLIENT_SECRET (optional), UAEPASS_IS_PROD=true/false
var cfg = builder.Configuration;
var clientId = cfg["UAEPASS_CLIENT_ID"] ?? "<CLIENT_ID>";
var clientSecret = cfg["UAEPASS_CLIENT_SECRET"]; // optional
var isProd = bool.TryParse(cfg["UAEPASS_IS_PROD"], out var prod) && prod;

builder.Services.AddHttpClient("uaepass");

builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();

string BaseUrl(bool prod) => prod ? "https://id.uaepass.ae" : "https://stg-id.uaepass.ae";
var tokenEndpoint = $"{BaseUrl(isProd)}/idshub/token";
var userInfoEndpoint = $"{BaseUrl(isProd)}/idshub/userinfo";

app.MapPost("/api/uae-pass/token", async ([FromBody] TokenRequest body, IHttpClientFactory f) =>
{
    var client = f.CreateClient("uaepass");

    var form = new List<KeyValuePair<string, string>>
    {
        new("redirect_uri", body.redirect_uri),
        new("client_id", clientId),
        new("grant_type", "authorization_code"),
        new("code", body.code),
        new("code_verifier", body.code_verifier)
    };
    if (!string.IsNullOrWhiteSpace(clientSecret))
        form.Add(new("client_secret", clientSecret));

    var content = new FormUrlEncodedContent(form);
    using var res = await client.PostAsync(tokenEndpoint, content);
    var json = await res.Content.ReadAsStringAsync();
    return Results.Content(json, "application/json");
});

app.MapPost("/api/uae-pass/userinfo", async ([FromBody] UserInfoRequest body, IHttpClientFactory f) =>
{
    var client = f.CreateClient("uaepass");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.token);
    using var res = await client.GetAsync(userInfoEndpoint);
    var json = await res.Content.ReadAsStringAsync();
    return Results.Content(json, "application/json");
});

app.Run();

public record TokenRequest(string code, string redirect_uri, string code_verifier);
public record UserInfoRequest(string token);
```

## Run

```bash
# Create a new empty project (or add to an existing API project)
dotnet new web -n UaepassProxy
cd UaepassProxy
# Replace Program.cs with the code above

# Windows PowerShell: set your env vars for dev
$env:UAEPASS_CLIENT_ID = "<CLIENT_ID>"
$env:UAEPASS_CLIENT_SECRET = "<CLIENT_SECRET>"   # optional
$env:UAEPASS_IS_PROD = "false"                    # or "true"

# Run on http://localhost:3000 (default Kestrel port may vary)
dotnet run
```

## Angular config

```ts
provideUaePass({
  // ...
  tokenProxyUrl: 'http://localhost:3000/api/uae-pass/token',
  userInfoProxyUrl: 'http://localhost:3000/api/uae-pass/userinfo',
})
```

Tip: If your Angular dev server proxies via `proxy.conf.json`, you can set `tokenProxyUrl: '/api/uae-pass/token'` and point the dev proxy to your .NET API.
