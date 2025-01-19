# very cool raid calculator

## how to deploy

```bash
git clone https://github.com/hasitotabla/raid && cd raid
docker build -t raid-calc .
docker run -d -p 127.0.0.1:8053:80 raid-calc
```

<small>or use 127.0.0.1:80:80 to use it locally</small>

### Caddy Reverse Proxy Config (not required)

```caddy
*.yourdomain.tld {
    @raid host raid.yourdomain.tld
    handle @raid {
        reverse_proxy 127.0.0.1:8053
    }
}
```
