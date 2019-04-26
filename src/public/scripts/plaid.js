var handler = Plaid.create({
    apiVersion: 'v2',
    clientName: 'Plaid Quickstart',
    env: PLAID_ENV,
    product: 'transactions',
    key: PLAID_PUBLIC_KEY,
    webhook: URL + '/plaid-webhook',
    onSuccess: function (public_token, metadata) {
        $.post(
            '/get_access_token',
            {
                public_token: public_token,
                institutionName: metadata.institution.name,
            },
            function (data) {
                user.items.push(data);
            }
        );
    },
});