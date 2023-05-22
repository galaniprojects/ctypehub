export class NotFoundResponse extends Response {
  constructor(statusText = 'Page not found') {
    super(null, {
      status: 404,
      statusText,
    });
  }
}
