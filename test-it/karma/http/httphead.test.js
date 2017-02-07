describe('Performing a HEAD request', function () {
    'use strict';
    // Reference aliases
    var Vireo = window.NationalInstruments.Vireo.Vireo;
    var vireoRunner = window.testHelpers.vireoRunner;
    var fixtures = window.testHelpers.fixtures;
    var httpBinHelpers = window.testHelpers.httpBinHelpers;
    var httpParser = window.testHelpers.httpParser;

    var vireo;

    beforeEach(function (done) {
        httpBinHelpers.queryHttpBinStatus(done);
    });

    beforeEach(function () {
        httpBinHelpers.makeTestPendingIfHttpBinOffline();
        // TODO mraj create shared vireo instances to improve test perf https://github.com/ni/VireoSDK/issues/163
        vireo = new Vireo();
    });

    it('with a simple 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadMethod.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('get');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();
            expect(viPathParser('handle')).toBe(0);
            expect(viPathParser('headers')).toBeNonEmptyString();
            expect(viPathParser('statusCode')).toBe(200);
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();
            done();
        });
    });

    it('validating a simple 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadMethod.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('get');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle
            expect(viPathParser('handle')).toBe(0);

            // header
            var responseHeader = httpParser.parseResponseHeader(viPathParser('headers'));
            expect(responseHeader.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader.statusCode).toBe(200);
            expect(responseHeader.reasonPhrase).toBe('OK');
            expect(responseHeader.headers).toBeNonEmptyObject();

            // status code
            expect(viPathParser('statusCode')).toBe(200);

            // error
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();

            done();
        });
    });

    // NOTE: Validation of a 404 response code was moved to a non-PhantomJS test

    it('validating an unusual 4XX response code', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadMethod.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('status/418');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle
            expect(viPathParser('handle')).toBe(0);

            // header
            var responseHeader = httpParser.parseResponseHeader(viPathParser('headers'));
            expect(responseHeader.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader.statusCode).toBe(418);
            expect(responseHeader.reasonPhrase).toBe('I\'M A TEAPOT');
            expect(responseHeader.headers).toBeNonEmptyObject();

            // status code
            expect(viPathParser('statusCode')).toBe(418);

            // error
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();

            done();
        });
    });

    it('validating a response with UTF8 data', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadMethod.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('encoding/utf8');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle
            expect(viPathParser('handle')).toBe(0);

            // header
            var responseHeader = httpParser.parseResponseHeader(viPathParser('headers'));
            expect(responseHeader.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader.statusCode).toBe(200);
            expect(responseHeader.reasonPhrase).toBe('OK');
            expect(responseHeader.headers).toBeNonEmptyObject();

            // status code
            expect(viPathParser('statusCode')).toBe(200);

            // error
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();

            done();
        });
    });

    it('with open, get, close and a simple 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadOpenMethodClose.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('get');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();
            expect(viPathParser('handle')).toBeGreaterThan(0);
            expect(viPathParser('headers')).toBeNonEmptyString();
            expect(viPathParser('statusCode')).toBe(200);
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();
            done();
        });
    });

    it('with open, get, close and validates a 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadOpenMethodClose.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('get');
        viPathWriter('url', url);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle
            expect(viPathParser('handle')).toBeGreaterThan(0);

            // header
            var responseHeader = httpParser.parseResponseHeader(viPathParser('headers'));
            expect(responseHeader.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader.statusCode).toBe(200);
            expect(responseHeader.reasonPhrase).toBe('OK');
            expect(responseHeader.headers).toBeNonEmptyObject();

            // status code
            expect(viPathParser('statusCode')).toBe(200);

            // error
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();
            done();
        });
    });

    it('with open, add header, get, close and validates a 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadOpenAddMethodClose.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url = httpBinHelpers.convertToAbsoluteUrl('get');
        var header = 'birdperson';
        var value = 'in bird culture this is considered a dick move';
        viPathWriter('url', url);
        viPathWriter('header', header);
        viPathWriter('value', value);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle
            expect(viPathParser('handle')).toBeGreaterThan(0);

            // header
            var responseHeader = httpParser.parseResponseHeader(viPathParser('headers'));
            expect(responseHeader.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader.statusCode).toBe(200);
            expect(responseHeader.reasonPhrase).toBe('OK');
            expect(responseHeader.headers).toBeNonEmptyObject();

            // status code
            expect(viPathParser('statusCode')).toBe(200);

            // error
            expect(viPathParser('error.status')).toBeFalse();
            expect(viPathParser('error.code')).toBe(0);
            expect(viPathParser('error.source')).toBeEmptyString();
            done();
        });
    });

    it('in parallel and validates a 200 response', function (done) {
        var viaPath = fixtures.convertToAbsoluteFromFixturesDir('http/HeadParallel.via');

        var runSlicesAsync = vireoRunner.rebootAndLoadVia(vireo, viaPath);
        var viPathParser = vireoRunner.createVIPathParser(vireo, 'MyVI');
        var viPathWriter = vireoRunner.createVIPathWriter(vireo, 'MyVI');

        var url1 = httpBinHelpers.convertToAbsoluteUrl('get');
        var header1 = 'birdperson';
        var value1 = 'in bird culture this is considered a dick move';
        viPathWriter('url1', url1);
        viPathWriter('header1', header1);
        viPathWriter('value1', value1);

        var url2 = httpBinHelpers.convertToAbsoluteUrl('get');
        var header2 = 'mrmeeseeks';
        var value2 = 'look at me';
        viPathWriter('url2', url2);
        viPathWriter('header2', header2);
        viPathWriter('value2', value2);

        runSlicesAsync(function (rawPrint, rawPrintError) {
            expect(rawPrint).toBeEmptyString();
            expect(rawPrintError).toBeEmptyString();

            // handle 1
            expect(viPathParser('handle1')).toBeGreaterThan(0);

            // header 1
            var responseHeader1 = httpParser.parseResponseHeader(viPathParser('headers1'));
            expect(responseHeader1.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader1.statusCode).toBe(200);
            expect(responseHeader1.reasonPhrase).toBe('OK');
            expect(responseHeader1.headers).toBeNonEmptyObject();

            // status code 1
            expect(viPathParser('statusCode1')).toBe(200);

            // error 1
            expect(viPathParser('error1.status')).toBeFalse();
            expect(viPathParser('error1.code')).toBe(0);
            expect(viPathParser('error1.source')).toBeEmptyString();

            // handle 2
            expect(viPathParser('handle2')).toBeGreaterThan(0);

            // header 2
            var responseHeader2 = httpParser.parseResponseHeader(viPathParser('headers2'));
            expect(responseHeader2.httpVersion).toBe('HTTP/1.1');
            expect(responseHeader2.statusCode).toBe(200);
            expect(responseHeader2.reasonPhrase).toBe('OK');
            expect(responseHeader2.headers).toBeNonEmptyObject();

            // status code 2
            expect(viPathParser('statusCode2')).toBe(200);

            // error 2
            expect(viPathParser('error2.status')).toBeFalse();
            expect(viPathParser('error2.code')).toBe(0);
            expect(viPathParser('error2.source')).toBeEmptyString();
            done();
        });
    });
});