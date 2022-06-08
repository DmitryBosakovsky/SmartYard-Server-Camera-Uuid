({
    startPage: 1,

    init: function () {
        if (AVAIL("accounts", "group")) {
            leftSide("fas fa-fw fa-users", i18n("groups.groups"), "#groups");
        }
        moduleLoaded("groups", this);
    },

    /*
        action functions
     */

    doAddGroup: function (acronym, name) {
        loadingStart();
        POST("accounts", "group", false, {
            acronym: acronym,
            name: name,
        }).
        fail(FAIL).
        done(() => {
            message(i18n("groups.groupWasAdded"));
        }).
        always(window.modules["groups"].render);
    },

    doModifyGroup: function (gid, acronym, name) {
        loadingStart();
        PUT("accounts", "group", gid, {
            acronym: acronym,
            name: name,
        }).
        fail(FAIL).
        done(() => {
            message(i18n("groups.groupWasChanged"));
        }).
        always(window.modules["groups"].render);
    },

    doDeleteGroup: function (gid) {
        loadingStart();
        DELETE("accounts", "group", gid).
        fail(FAIL).
        done(() => {
            message(i18n("groups.groupWasDeleted"));
        }).
        always(window.modules["groups"].render);
    },

    /*
        UI functions
     */

    addGroup: function () {
        cardForm({
            title: i18n("groups.add"),
            footer: true,
            borderless: true,
            topApply: true,
            fields: [
                {
                    id: "acronym",
                    type: "text",
                    title: i18n("groups.acronym"),
                    placeholder: i18n("groups.acronym"),
                    validate: (v) => {
                        return $.trim(v) !== "";
                    }
                },
                {
                    id: "name",
                    type: "text",
                    title: i18n("groups.name"),
                    placeholder: i18n("groups.name"),
                    validate: (v) => {
                        return $.trim(v) !== "";
                    }
                },
            ],
            callback: function (result) {
                window.modules["groups"].doAddGroup(result.acronym, result.name);
            },
        }).show();
    },

    modifyGroup: function (gid) {
        loadingStart();
        GET("accounts", "group", gid, true).done(response => {
            cardForm({
                title: i18n("groups.edit"),
                footer: true,
                borderless: true,
                topApply: true,
                fields: [
                    {
                        id: "gid",
                        type: "text",
                        readonly: true,
                        value: response.group.gid.toString(),
                        title: i18n("groups.gid"),
                    },
                    {
                        id: "acronym",
                        type: "text",
                        value: response.group.acronym,
                        placeholder: i18n("groups.acronym"),
                        title: i18n("groups.acronym"),
                        validate: (v) => {
                            return $.trim(v) !== "";
                        }
                    },
                    {
                        id: "name",
                        type: "text",
                        value: response.group.name,
                        title: i18n("groups.name"),
                        placeholder: i18n("groups.name"),
                        validate: (v) => {
                            return $.trim(v) !== "";
                        }
                    },
                    {
                        id: "delete",
                        type: "select",
                        value: "",
                        title: i18n("groups.delete"),
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
                        window.modules["groups"].deleteGroup(result.gid);
                    } else {
                        window.modules["groups"].doModifyGroup(result.gid, result.acronym, result.name);
                    }
                },
            }).show();
        }).
        fail(FAIL).
        always(loadingDone);
    },

    deleteGroup: function (gid) {
        mConfirm(i18n("groups.confirmDelete", gid.toString()), i18n("confirm"), `danger:${i18n("groups.delete")}`, () => {
            window.modules["groups"].doDeleteGroup(gid);
        });
    },

    modifyGroupUsers: function (gid) {
        loadingStart();
        GET("accounts", "users", false, true).done(users => {
            GET("accounts", "groupUsers", gid, true).done(uids => {
                console.log(uids);

                let users_list = [];

                for (let i in users.users) {
                    users_list.push({
                        id: users.users[i].uid,
                        text: $.trim(users.users[i].realName + " [" + users.users[i].login + "]"),
                    });
                }

                cardForm({
                    title: i18n("groups.users") + " " + i18n("groups.gid") + gid,
                    footer: true,
                    borderless: true,
                    topApply: true,
                    target: "#altForm",
                    singleColumn: true,
                    fields: [
                        {
                            id: "users",
                            type: "multiselect",
                            options: users_list,
                            value: uids.uids,
                        }
                    ],
                    callback: result => {
                        loadingStart();
                        $("#altForm").hide();
                        PUT("accounts", "groupUsers", gid, {
                            uids: result.users,
                        }).
                        fail(FAIL).
                        done(() => {
                            message(i18n("groups.groupWasChanged"));
                        }).
                        always(window.modules["groups"].render);
                    },
                    cancel: () => {
                        $("#altForm").hide();
                    }
                }).show();
            }).
            fail(FAIL);
        }).
        fail(FAIL).
        always(loadingDone);
    },

    /*
        main form (groups) render function
     */

    render: function () {
        $("#altForm").hide();

        loadingStart();

        GET("accounts", "groups", false, true).done(response => {
            cardTable({
                title: {
                    caption: i18n("groups.groups"),
                    button: {
                        caption: i18n("groups.addGroup"),
                        click: window.modules["groups"].addGroup,
                    },
                    filter: true,
                },
                startPage: window.modules["groups"].startPage,
                columns: [
                    {
                        title: i18n("groups.gid"),
                    },
                    {
                        title: i18n("groups.acronym"),
                    },
                    {
                        title: i18n("groups.name"),
                        fullWidth: true,
                    },
                    {
                        title: i18n("groups.usersCount"),
                        fullWidth: true,
                    },
                ],
                rows: () => {
                    let rows = [];

                    for (let i = 0; i < response.groups.length; i++) {
                        rows.push({
                            uid: response.groups[i].gid.toString(),
                            cols: [
                                {
                                    data: response.groups[i].gid,
                                    click: window.modules["groups"].modifyGroup,
                                },
                                {
                                    data: response.groups[i].acronym,
                                    click: window.modules["groups"].modifyGroup,
                                    nowrap: true,
                                },
                                {
                                    data: response.groups[i].name,
                                    nowrap: true,
                                },
                                {
                                    data: response.groups[i].users,
                                    click: window.modules["groups"].modifyGroupUsers,
                                },
                            ],
                        });
                    }

                    return rows;
                },
                target: "#mainForm",
                pageChange: page => {
                    window.modules["groups"].startPage = page;
                },
            });
        }).
        fail(FAIL).
        always(loadingDone);
    },

    route: function (params) {
        document.title = i18n("windowTitle") + " :: " + i18n("groups.groups");

        window.modules["groups"].render();
    }
}).init();