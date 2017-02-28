import { ObClientPage } from './app.po';

describe('ob-client App', function() {
  let page: ObClientPage;

  beforeEach(() => {
    page = new ObClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
