import * as req from "request-promise";

const request = req.defaults({
    baseUrl: process.env.vessel_API,
    json: true
})

const vesselAPI = {
    getOne: function (vesselHref: string) {
        let pr = request.get({
            url: "/view",
            qs: {
                vesselHref
            }
        })
        pr.catch(err => console.error(err))
        return pr
    },
    find: function (text: string) {
        let pr = request.get({
            url: "/search/" + text,
        })
        pr.catch(err => console.error(err))
        return pr
    },
    imageFind: function (mmsi: string | number) {
        let pr = request.get({
            url: "/imageFind/",
            qs: {
                mmsi
            }
        })
        pr.catch(err => console.error(err))
        return pr
    },
}

export default vesselAPI