# GROKBOT_TEST: the 12 watch questions for INN514

Written by ZCode + GLM 5.3 Flash on 2026-10-24 from the knowledge pack files only
(`grok-watch-hub/knowledge/inn514/`). Spec: `GROKBOT_PLAN.md`, Part C.
The machine-readable twin of this file is `checks/grokbot_tests.json`.

## How to run the test

1. Say each sentence below to the watch, to Grokbot on the wrist. Every sentence starts
   with "Grok principal," so the watch delegates to Grok Principal (`muse_hub.c:464`).
   Note the time before the first question.
2. Wait for the answers to land in `grok-watch-hub/outbox/`.
3. Then check them:

       C:/Python313/python.exe workspace/lecture-audio/scripts/check_outbox.py --pull --since <start time, e.g. 20261024T0900Z>

   `--pull` updates the hub first (only Claude Code or you run it). `--ids <id> <id>` checks
   single replies instead of `--since`. Every reply prints PASS or FAIL per check and the
   spoken text, so the facts below can be judged by ear or by eye.

## What the checker verifies per reply

`status` is "done"; the answer names its expected source ("clase 4" plus "capítulo 3", or
"paper 14" plus "764"); it is in Spanish; it is 8 sentences or fewer; and for the
out-of-scope question it says "no cubre", "no aparece", "no trata" or "no está".
Whether the facts themselves are right is judged against the quoted pack lines below.

## The 12 questions

### Class questions

1. **Clase 4, capítulo 3** — say: "Grok principal, explícame los dos modelos del ecosistema de la clase 4, capítulo 3."
   - "At the base sit institutional arrangements."
   - "Proposition three, downward causation, describes a feedback loop"
   - "The model sorts the ecosystem into three interdependent elements: cultural, social and material."
2. **Clase 1, capítulo 4** — say: "Grok principal, ¿cuál es la diferencia entre STI y DUI en la clase 1, capítulo 4?"
   - "The first way is called STI, short for science, technology and innovation."
   - "The knowledge behind it is synthetic knowledge. It is practical, often tacit, built on experience and tied to a particular place and situation."
3. **Clase 2, capítulo 3** — say: "Grok principal, ¿de qué se compone un sistema regional de innovación según la clase 2, capítulo 3?"
   - "The first subsystem is firms and industries, which are often organised in clusters, together with the public sector."
   - "The third is support organisations, such as regional authorities, cluster organisations and incubators."
4. **Clase 3, capítulo 2** — say: "Grok principal, sobre equipos, herramientas y tareas, ¿qué dice la clase 3, capítulo 2?"
   - "In each one, we find teams, tools and tasks."
   - "They remind us that technology cannot be understood in isolation from its socio-cultural system."

### Paper questions

5. **Paper 14, página 764** — say: "Grok principal, ¿qué cuenta el paper 14 en la página 764?"
   - "In 1997 the state railway decided to end operations."
   - "The deal combined institutional and Schumpeterian entrepreneurship."
   - "in 2018 Parliament decided that the world heritage fjords must be zero emission by 2026"
6. **Paper 1, página 431** — say: "Grok principal, resume la página 431 del paper 1."
   - "They trace the national innovation system concept to Freeman (1987), Lundvall (1992) and Nelson (1993)."
   - "economic benefits come primarily from applying knowledge to production"
7. **Paper 7, página 813** — say: "Grok principal, ¿qué modelos compara el paper 7 en la página 813?"
   - "Isenberg named six domains: policy, finance, culture, support, human capital and markets."
   - "the authors build a model of ten elements"
8. **Paper 3, página 14** — say: "Grok principal, ¿cuál es el objetivo del estudio en el paper 3, página 14?"
   - "The authors introduce their study of regional key actors and green industrial restructuring in petroleum-dependent regions."
   - "The authors respond by combining evolutionary economic geography with institutional work, comparing Hordaland and Rogaland in Western Norway."
9. **Paper 5, página 323** — say: "Grok principal, habla de la renovación regional en el paper 5, página 323."
   - "The authors argue that taking part in internationalisation and having related variety are decisive for the degree of regional renewal."
   - "It concentrates petroleum, seafood and the maritime sector, is often called the gold coast"

### Paper 2 (paraphrase only) and Paper 4

10. **Paper 2** — say: "Grok principal, ¿de qué trata el paper 2?"
    The answer must paraphrase the paper and never quote it: the pack marks it
    "paper in preparation, do not quote". Listen for a spoken summary, not memorised sentences.
11. **Paper 4** — say: "Grok principal, ¿qué proponen los autores del paper 4?"
    - "the authors call for a paradigm shift towards systems dedicated to sustainability, with research on directionality, legitimacy and responsibility"
    - "Among the eight authors are Fagerberg and Andersen."

### Out of scope

12. Say: "Grok principal, ¿quién ganó el último partido de fútbol de la Champions?"
    The answer must say, in effect, that the course does not cover it: the checker accepts
    "no cubre", "no aparece", "no trata" or "no está".
