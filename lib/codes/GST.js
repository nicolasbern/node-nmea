var Helper = require("../Helper.js");

/** 

 === GST - GPS Pseudorange Noise Statistics ===

 ------------------------------------------------------------------------------
 *******1   2   3   4   5   6   7   8   9
 *******|   |   |   |   |   |   |   |   |
 $--GST,x.x,x.x,x.x,x.x,x.x,x.x,x.x,x.x*hh<CR><LF>
 ------------------------------------------------------------------------------

 Field Number:

 1    = UTC of position fix
 2    = RMS value of the pseudorange residuals; includes carrier phase residuals during periods of RTK (float) and RTK (fixed) processing
 3    = Error ellipse semi-major axis 1 sigma error, in meters
 4    = Error ellipse semi-minor axis 1 sigma error, in meters
 5    = Error ellipse orientation, degrees from true north
 6    = Latitude 1 sigma error, in meters
 7    = Longitude 1 sigma error, in meters
 8    = Height 1 sigma error, in meters
 9    = The checksum data, always begins with *

 e.g $GPGST,172814.0,0.006,0.023,0.020,273.6,0.023,0.020,0.031*6A

 */

exports.Decoder = function(id) {
    this.id = id;
    this.talker_type_id = "GST";
    this.talker_type_desc = "GPS Pseudorange Noise Statistics";
    
    this._roundRms = function(rms){
        if (rms > 2) {
            rms = rms.toFixed(1);
        } else if (rms > 0.5) {
            rms = rms.toFixed(2);
        } else {
            rms = rms.toFixed(3);
        }
        return rms;
    };

    this._calculateRms = function(latitudeError, longitudeError){
        return Math.sqrt((Math.pow(latitudeError, 2) + Math.pow(longitudeError, 2)));
    };

    this.parse = function(tokens) {
        if(tokens.length < 8) {
            throw new Error('GST : not enough tokens');
        }
        
        var data = {
            id : tokens[0].substr(1),
            talker_type_id: this.talker_type_id,
            talker_type_desc: this.talker_type_desc,
            time: tokens[1],
            residualsRms: Helper.parseFloatX(tokens[2]),
            semiMajorError: Helper.parseFloatX(tokens[3]),
            semiMinorError: Helper.parseFloatX(tokens[4]),
            orientationError: Helper.parseFloatX(tokens[5]),
            latitudeError: Helper.parseFloatX(tokens[6]),
            longitudeError: Helper.parseFloatX(tokens[7]),
            altitudeError: Helper.parseFloatX(tokens[8])
        };

        // See http://www.radio-electronics.com/info/satellite/gps/accuracy-errors-precision.php
        data.rms1D = this._roundRms(this._calculateRms(data.latitudeError, data.longitudeError));
        data.rms2D = this._roundRms(2*this._calculateRms(data.latitudeError, data.longitudeError));
        data.rms3D = this._roundRms(3*this._calculateRms(data.latitudeError, data.longitudeError));
        
        return data;
    };
};