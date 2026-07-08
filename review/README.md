# Review

This directory is the staging area for blog material that is not yet approved for publication.

Hexo does not publish this directory because it is outside `source/`.

## Flow

```text
review/inbox/ -> review/sanitized/ -> source/_posts/
                         |
                         v
                  review/rejected/
```

- `inbox/`: raw copied notes or candidate material from external Markdown projects.
- `sanitized/`: drafts that have been rewritten, structured, and checked for obvious sensitive information.
- `rejected/`: retained material that should not be published.

Do not move files into `source/_posts/` until the user has explicitly approved publication.
