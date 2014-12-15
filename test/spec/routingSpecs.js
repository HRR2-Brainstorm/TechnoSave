describe('Routing', function () {
  var $state;
  beforeEach(module('App'));

  beforeEach(inject(function($injector){
    $state = $injector.get('$state');
  }));

  it('Should have the states and associated templates and controllers', function () {
    expect($state.get('home')).to.be.ok();
    expect($state.get('home').templateUrl).to.equal('partial-items.html');
  });

});
