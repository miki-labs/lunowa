# Gmail Pub/Sub runtime binding

This module owns the deployable Gmail notification path required by G20. It
creates the `users.watch` topic, grants the Google-managed Gmail push identity
topic publish access, creates an authenticated push subscription, and grants
the Pub/Sub service agent permission to mint the callback OIDC token.

Apply it with the deployed HTTPS callback as both `push_endpoint` and
`oidc_audience`, then transfer the three non-secret outputs to the matching
application variables. Keep Terraform state in the deployment control plane;
do not commit state or credentials.

An applied plan and a real authenticated delivery remain operator evidence.
The module and deterministic tests prove the binding is declared, not that a
particular Google Cloud project has been changed.
