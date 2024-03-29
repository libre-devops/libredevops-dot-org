---
layout: default
title: Home
nav_order: 1
description: "A source for open-source scripts, documentation and cheatsheets"
permalink: /
---

# Welcome to Libre DevOps

<p align="center">
    <img src="/assets/images/libre-devops-white.png">
</p>


## Free & Open Source

Libre DevOps has 2 core principles:

- Freedom to achieve a DevOps task, however you can, using your own workflow.
- Free in cost, to get started in solving your task.

Everything you find in this site is free and open source (as far concepts and work completed, read all license terms regarding products that are being used for yourself :wink:), including [the site itself](https://github.com/libre-devops/libredevops-dot-org), under the MIT license.

The concept of the site is to provide a community-driven initiative under a single, user-friendly name, to provide resources to help you get started on your DevOps journey quickly, with as much best practice and quick start up info as possible.  You are free to copy everything you find here, but we would really welcome you to contribute and join us any way you can!

As such, if you see something or DevOps resources under the Libre DevOps banner, by all means, fork it, copy and paste it, tweak it and sell it for millions, completely up to you!

Hopefully the resources will help you get started down your journey, if you find any issues, feel free to raise a GitHub issue or pull request with your questions.

### Can't find what you are looking for?

Libre DevOps works in cooperation with [CyberScot](https://cyber.scot), check out the [GitHub](https://github.com/cyber-scot) there, otherwise, if you wish to contact the site owner in its current iteration directly and discreetly, please use the contact link at the bottom of the page.  You can also raise an Issue on the GitHub :wink:


#### Thank you to the contributors of Libre DevOps!

<ul class="list-style-none">
{% for contributor in site.github.contributors %}
  <li class="d-inline-block mr-1">
     <a href="{{ contributor.html_url }}"><img src="{{ contributor.avatar_url }}" width="32" height="32" alt="{{ contributor.login }}"></a>
  </li>
{% endfor %}
</ul>
