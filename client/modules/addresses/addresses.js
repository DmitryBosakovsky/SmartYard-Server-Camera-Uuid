({
    init: function () {
        if (AVAIL("addresses", "region", "PUT")) {
            leftSide("fas fa-fw fa-home", i18n("addresses.addresses"), "#addresses");
        }

        moduleLoaded("addresses", this);
    },

    addresses: function (addresses) {
        modules["addresses"].meta = addresses["addresses"];
        console.log(modules["addresses"].meta);
    },

    doAddRegion: function (regionFiasId, regionIsoCode, regionWithType, regionType, regionTypeFull, region) {
        loadingStart();
        POST("addresses", "region", false, {
            regionFiasId: regionFiasId,
            regionIsoCode: regionIsoCode,
            regionWithType: regionWithType,
            regionType: regionType,
            regionTypeFull: regionTypeFull,
            region: region,
        }).
        fail(FAIL).
        done(() => {
            message(i18n("addresses.regionWasAdded"));
        }).
        always(modules["addresses"].renderRegions);
    },

    addRegion: function () {
        cardForm({
            title: i18n("addresses.addRegion"),
            footer: true,
            borderless: true,
            topApply: true,
            apply: i18n("add"),
            fields: [
                {
                    id: "regionFiasId",
                    type: "text",
                    title: i18n("addresses.regionFiasId"),
                    placeholder: i18n("addresses.regionFiasId"),
                },
                {
                    id: "regionIsoCode",
                    type: "text",
                    title: i18n("addresses.regionIsoCode"),
                    placeholder: i18n("addresses.regionIsoCode"),
                },
                {
                    id: "regionWithType",
                    type: "text",
                    title: i18n("addresses.regionWithType"),
                    placeholder: i18n("addresses.regionWithType"),
                    validate: (v) => {
                        return $.trim(v) !== "";
                    }
                },
                {
                    id: "regionType",
                    type: "text",
                    title: i18n("addresses.regionType"),
                    placeholder: i18n("addresses.regionType"),
                },
                {
                    id: "regionTypeFull",
                    type: "text",
                    title: i18n("addresses.regionTypeFull"),
                    placeholder: i18n("addresses.regionTypeFull"),
                },
                {
                    id: "region",
                    type: "text",
                    title: i18n("addresses.region"),
                    placeholder: i18n("addresses.region"),
                    validate: (v) => {
                        return $.trim(v) !== "";
                    }
                },
            ],
            callback: function (result) {
                modules["addresses"].doAddRegion(result.regionFiasId, result.regionIsoCode, result.regionWithType, result.regionType, result.regionTypeFull, result.region);
            },
        }).show();
    },

    doModifyRegion: function (regionId, regionFiasId, regionIsoCode, regionWithType, regionType, regionTypeFull, region) {
        loadingStart();
        PUT("addresses", "region", regionId, {
            regionFiasId: regionFiasId,
            regionIsoCode: regionIsoCode,
            regionWithType: regionWithType,
            regionType: regionType,
            regionTypeFull: regionTypeFull,
            region: region,
        }).
        fail(FAIL).
        done(() => {
            message(i18n("addresses.regionWasAdded"));
        }).
        always(modules["addresses"].renderRegions);
    },

    doDeleteRegion: function (regionId) {
        loadingStart();
        DELETE("addresses", "region", regionId).
        fail(FAIL).
        done(() => {
            message(i18n("addresses.regionWasDeleted"));
        }).
        always(modules["addresses"].renderRegions);
    },

    deleteRegion: function (regionId) {
        mConfirm(i18n("addresses.confirmDeleteRegion", regionId), i18n("confirm"), `danger:${i18n("addresses.deleteRegion")}`, () => {
            modules["addresses"].doDeleteRegion(regionId);
        });
    },

    modifyRegion: function (regionId) {
        let region = false;

        for (let i in modules["addresses"].meta.regions) {
            if (modules["addresses"].meta.regions[i].regionId == regionId) {
                region = modules["addresses"].meta.regions[i];
                break;
            }
        }

        if (region) {
            cardForm({
                title: i18n("addresses.editRegion"),
                footer: true,
                borderless: true,
                topApply: true,
                fields: [
                    {
                        id: "regionId",
                        type: "text",
                        title: i18n("addresses.regionId"),
                        value: regionId,
                        readonly: true,
                    },
                    {
                        id: "regionFiasId",
                        type: "text",
                        title: i18n("addresses.regionFiasId"),
                        placeholder: i18n("addresses.regionFiasId"),
                        value: region.regionFiasId,
                    },
                    {
                        id: "regionIsoCode",
                        type: "text",
                        title: i18n("addresses.regionIsoCode"),
                        placeholder: i18n("addresses.regionIsoCode"),
                        value: region.regionIsoCode,
                    },
                    {
                        id: "regionWithType",
                        type: "text",
                        title: i18n("addresses.regionWithType"),
                        placeholder: i18n("addresses.regionWithType"),
                        validate: (v) => {
                            return $.trim(v) !== "";
                        },
                        value: region.regionWithType,
                    },
                    {
                        id: "regionType",
                        type: "text",
                        title: i18n("addresses.regionType"),
                        placeholder: i18n("addresses.regionType"),
                        value: region.regionType,
                    },
                    {
                        id: "regionTypeFull",
                        type: "text",
                        title: i18n("addresses.regionTypeFull"),
                        placeholder: i18n("addresses.regionTypeFull"),
                        value: region.regionTypeFull,
                    },
                    {
                        id: "region",
                        type: "text",
                        title: i18n("addresses.region"),
                        placeholder: i18n("addresses.region"),
                        validate: (v) => {
                            return $.trim(v) !== "";
                        },
                        value: region.region,
                    },
                    {
                        id: "delete",
                        type: "select",
                        value: "",
                        title: i18n("address.deleteRegion"),
                        options: [
                            {
                                value: "",
                                text: "",
                            },
                            {
                                value: "yes",
                                text: i18n("yes"),
                            },
                        ]
                    },
                ],
                callback: function (result) {
                    if (result.delete === "yes") {
                        modules["addresses"].deleteRegion(result.regionId);
                    } else {
                        modules["addresses"].doModifyRegion(regionId, result.regionFiasId, result.regionIsoCode, result.regionWithType, result.regionType, result.regionTypeFull, result.region);
                    }
                },
            }).show();
        }
    },

    renderRegions: function () {
        loadingStart();
        GET("addresses", "addresses", false, true).
        done(modules["addresses"].addresses).
        done(() => {
            cardTable({
                title: {
                    caption: i18n("addresses.regions"),
                    button: {
                        caption: i18n("addresses.addRegion"),
                        click: modules["addresses"].addRegion,
                    },
                    filter: true,
                },
                edit: modules["addresses"].modifyRegion,
                columns: [
                    {
                        title: i18n("addresses.regionId"),
                    },
                    {
                        title: i18n("addresses.region"),
                        fullWidth: true,
                    },
                ],
                rows: () => {
                    let rows = [];

                    for (let i in modules["addresses"].meta.regions) {
                        rows.push({
                            uid: modules["addresses"].meta.regions[i].regionId.toString(),
                            cols: [
                                {
                                    data: modules["addresses"].meta.regions[i].regionId,
                                },
                                {
                                    data: modules["addresses"].meta.regions[i].regionWithType,
                                    nowrap: true,
                                },
                            ],
                        });
                    }

                    return rows;
                },
                target: "#mainForm",
            });
        }).
        fail(FAIL).
        always(loadingDone);
    },

    route: function (params) {
        $("#altForm").hide();

        document.title = i18n("windowTitle") + " :: " + i18n("addresses.addresses");
        $("#mainForm").html(i18n("addresses.addresses"));

        switch (params.show) {
            default:
                modules["addresses"].renderRegions();
                break;
        }
    },

    // if search function is defined, search string will be displayed
    search: function (str) {
        console.log("addresses: " + str);
    },
}).init();