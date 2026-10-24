# Explanation

These pages discuss why GovKit works the way it does: the design decisions, the constraints behind them, and the alternatives that were set aside. Read them away from the keyboard, when you want to understand GovKit rather than use it.

| About | The question it answers |
|-------|-------------------------|
| [The overlay model](overlay-model.md) | Why does GovKit sit on top of ArcKit instead of extending or forking it? |
| [The GOV- prefix](gov-prefix.md) | Why do GovKit artefacts have their own prefix? |
| [Configuration layers](configuration-layers.md) | Why does every setting resolve through project, organisation and built-in layers? |
| [Evidence and judgement](evidence-and-judgement.md) | Why are reading evidence and rating controls done by separate agents, and why does GovKit never approve? |
| [Brands](brands.md) | Why is presentation one central setting, and what may it never change? |
| [Diagrams as draw.io files](drawio-diagrams.md) | Why draw.io rather than Mermaid, and why validate diagrams? |
| [Team design](team-design.md) | Why streams and chapters, and why is the JSON model the source of truth? |
| [Tracking ArcKit](tracking-arckit.md) | How does GovKit stay compatible with releases it hasn't seen yet? |
| [GovKit modules](overlays.md) | Why are standards like GovStack separate GovKit modules, and why is the GovStack verdict strict and binary? |
