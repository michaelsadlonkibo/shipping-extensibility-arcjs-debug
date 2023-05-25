module.exports = function (context, callback) {
    route(context, callback)
        .then(response => callback(null, response))
        .catch(error => callback(error));
};

// Shipment label image
const SHIPMENT_LABEL_IMG_DATA = 'shipment-label-img-data';

// Return label image
const RETURN_LABEL_IMG_DATA = 'return-label-img-data';

async function route(context, callback) {
    const request = context.get.request();
    const method = context.get.method();

    const requestContext = request.context;
    const requestPayload = request.request;

    console.error(`DEBUG method: ${method}, request context: `, requestContext);
    console.error(`DEBUG request payload: `, requestPayload);

    if (method === 'rates') {
        return await getRates(requestContext, requestPayload);
    } else if (method === 'labels') {
        return await getLabels(requestContext, requestPayload);
    } else if (method === 'manifest') {
        return await getManifest(requestContext, requestPayload);
    } else if (method === 'manifest-url') {
        return await getManifestUrl(requestContext, requestPayload);
    } else if (method === 'cancel-labels') {
        return await cancelLabels(requestContext, requestPayload);
    }
}

async function getRates(context, request) {
    // TODO: Use something like this to drive the rates logic?
    // List should match the service types defined on the application
    let serviceTypes = [
        context.carrierId + '_Standard',
        context.carrierId + '_1_Day',
        context.carrierId + '_2_Day',
        context.carrierId + '_3_Day'
    ];

    return {
        carrierId: context.carrierId,
        shippingRates: [
            {
                code: context.carrierId + '_Standard',
                amount: 1.23,
                shippingItemRates: [],
                customAttributes: [],
                messages: []
            },
            {
                code: context.carrierId + '_3_Day',
                amount: 4.56,
                shippingItemRates: [],
                customAttributes: [],
                messages: []
            },
            {
                code: context.carrierId + '_2_Day',
                amount: 7.89,
                shippingItemRates: [],
                customAttributes: [],
                messages: []
            },
            {
                code: context.carrierId + '_1_Day',
                amount: 10.77,
                shippingItemRates: [],
                customAttributes: [],
                messages: []
            }
        ],
        customAttributes: [
            // Made up test data
            {
                childAttributes: [
                    {
                        childAttributes: [],
                        key: 'test_child1',
                        value: '1'
                    },
                    {
                        childAttributes: [],
                        key: 'test_child2',
                        value: '2'
                    },
                    {
                        childAttributes: [
                            {
                                childAttributes: [],
                                key: 'test_nested_child',
                                value: 'foo'
                            }
                        ],
                        key: 'test_child3'
                    }
                ],
                key: 'test'
            },
            {
                childAttributes: [],
                key: 'total_billing_weight',
                value: '1.0'
            }
        ]
    };
}

async function getLabels(context, request) {
    let response = {
        shippingTotal: {
            currencyCode: 'USD',
            value: 9.99
        },
        trackingNumber: 'fake1003451002998',
        packageResponses: [{
            id: '1',
            trackingNumber: 'fake1003451002998',
            label: {
                imageFormat: 'PNG',
                imageData: SHIPMENT_LABEL_IMG_DATA
            },
            customAttributes: []
        }],
        customAttributes: [
            // Copied from Fedex as an example
            {
                childAttributes: [
                    {
                        childAttributes: [],
                        key: 'base_charge',
                        value: '9.5'
                    },
                    {
                        childAttributes: [],
                        key: 'total_surcharges',
                        value: '0.49'
                    },
                    {
                        childAttributes: [
                            {
                                childAttributes: [],
                                key: 'FUEL',
                                value: '0.49'
                            }
                        ],
                        key: 'surcharges'
                    }
                ],
                key: 'package_rate_details'
            },
            {
                childAttributes: [],
                key: 'total_billing_weight',
                value: '1.0'
            }
        ],
        messages: [
            {
                source: 'foo',
                message: 'bar',
                code: 'wtf'
            }
        ],
        isSuccessful: true
    };

    // 'Shipment' or 'Return' types differ slightly
    if (request.shipmentRequestType === 'Return') {
        // Change label image
        response.packageResponses[0].label.imageData = RETURN_LABEL_IMG_DATA;

        // Strip some fields not normally returned
        response.shippingTotal = {};
        response.customAttributes = [];
    }

    return response;
}

async function getManifest(context, request) {
    return {
        manifestId: '1234',
        manifestUrl: 'https://example.com/manifest/1234',
        carrierId: context.carrierId,
        locationCode: request.locationCode,
        includedShipments: request.includedShipments, // Just copy the list back
        messages: [
            {
                source: 'foo',
                message: 'bar',
                code: 'wtf'
            }
        ],
        isSuccessful: true
    };
}

async function getManifestUrl(context, request) {
    const manifestId = request;
    return `https://example.com/manifest/${manifestId}`;
}

async function cancelLabels(context, request) {
    // TODO: Loop over and process these IDs
    let integratorIds = request.integratorIds;

    return {
        labelStatus: [
            {
                integratorId: '1000a',
                refundStatus: 'Refunded' // Integration dependent so using a mock value
            },
            {
                integratorId: '1000b',
                refundStatus: 'Failed' // Integration dependent so using a mock value
            }
        ],
        messages: [
            {
                source: 'foo',
                message: 'bar',
                code: 'wtf'
            }
        ],
        isSuccessful: true
    };
}
