# slidev-theme-TUD-new

A [TU Dresden](https://tu-dresden.de/) theme for [Slidev](https://github.com/slidevjs/slidev).

<!--
  Put some screenshots here to demonstrate your theme

  Live demo: [...]
-->

## Usage


`TODO`
To see an example of how to use this theme please refer to [the example repository](https://gitlab.barkhauseninstitut.org/max.kurze/slidev-bi-example)

If you really want to do it the hard way and wire things up manually
then the following will try to give you some hints at least.

You can install this theme into an existing repository using

```bash
$ pnpm install git+ssh://git@gitlab.barkhauseninstitut.org:max.kurze/slidev-theme-bi.git
```

Then you should be able to use it by setting the `theme` in your frontmatter:

```md
---
theme: TUD-new
---
```

Slidev automatically appends the `slidev-theme-` prefix to find the correct package.
(as described [here](https://sli.dev/guide/theme-addon#use-theme)).

## Layouts

This theme provides the following layouts:

- `cover-blue`
- `cover-white`
- `cover`
- `section-blue`
- `section-white`
- `section`
- `default`

## Components

This theme provides the following components:

None

## Contributing

- `pnpm install`
- `pnpm run dev` to start theme preview of `example.md`
- Edit the `example.md` and style to see the changes

## Notes

`./resources` is only used for development and not part of the theme

