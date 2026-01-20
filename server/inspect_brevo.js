const Brevo = require('@getbrevo/brevo');
console.log('Keys:', Object.keys(Brevo));
if (Brevo.ApiClient) {
    console.log('ApiClient exists');
    console.log('ApiClient instance:', !!Brevo.ApiClient.instance);
}
if (Brevo.TransactionalEmailsApi) {
    console.log('TransactionalEmailsApi exists');
    const instance = new Brevo.TransactionalEmailsApi();
    console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
}
