$(window).load(function(){
"use strict";

var Point3D = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

var Rotation3D = Point3D;

var Dimension3D = function (w, h, d) {
    this.w = w;
    this.h = h;
    this.d = d;
};

var Coin = function (settings) {
    function createPlane(dimension, origin, position, rotation, idOrClass) {
        return Sprite3D.create(idOrClass)
            .size(dimension.w, dimension.h)
            .origin(origin.x, origin.y, origin.z)
            .position(position.x, position.y, position.z)
            .rotation(rotation.x, rotation.y, rotation.z)
            .update()
    }

    function createBox(dimension, origin, position, rotation, idOrClass) {
        return Sprite3D.box(dimension.w, dimension.h, dimension.d, idOrClass)
            .origin(origin.x, origin.y, origin.z)
            .position(position.x, position.y, position.z)
            .rotation(rotation.x, rotation.y, rotation.z)
            .update();
    }

    var
    self = this,
        // stage setting variables
        stage,
        obj,
        shadow,
        depth = 1500,
        objDimension = settings.dimension || new Dimension3D(0, 0, 0),
        objPosition = settings.position || new Point3D(0, 0, 0),
        objRotation = settings.rotation || new Rotation3D(0, 0, 0),
        objClass = ".coin",

        // helper variables
        interval,
        direction = 1;

    this.isSupported = function () {
        return Sprite3D.isSupported();
    };

    this.toss = function (endsHead, callback) {
        if (this.isInTheAir) {
            return;
        }
        if (interval) {
            clearInterval(interval);
        }

        this.isInTheAir = true;

        var rotationSpeedX = 20 + Math.floor(Math.random() * 5),
            rotationSpeedY = 0.1,
            rotationSpeedZ = 3,
            height = 700 + Math.floor(Math.random() * 350),
            radius = objDimension.w / 2,

            interval = setInterval(function () {
                var z = obj.z(),
                    easing = Easing.Exponential.EaseOut((height - z) / height);

                if (direction < 0 && z <= 0) {
                    // the coin is landed on the floor
                    var rotationX = 15 + Math.floor(Math.random() * 15);
                    obj.rotation(rotationX, (endsHead ? 0 : -180), obj.rotationZ())
                        .position(objPosition.x, objPosition.y, Math.sin(Math.abs(rotationX) * Math.PI / 180) * radius * 2)
                        .update();

                    direction = 1;
                    clearInterval(interval);

                    // the finishing settling animation
                    rotationSpeedZ = 1 + Math.floor(Math.random() * 4);

                    interval = setInterval(function () {
                        var rotationX = obj.rotationX(),
                            absRotationX = Math.abs(rotationX),
                            radius = objDimension.w / 2;

                        if (absRotationX > 0) {
                            obj.z(Math.sin(absRotationX * Math.PI / 180) * radius * 2)
                                .rotation(rotationX > 0 ? -(absRotationX - 1) : absRotationX - 1, obj.rotationY(), obj.rotationZ() + rotationSpeedZ)
                                .update();
                        } else {
                            clearInterval(interval);

                            self.isInTheAir = false;

                            if (callback) {
                                callback.call();
                            }
                        }
                    }, 1000 / 40);
                } else {
                    // the coin is in the air
                    var moveZ = Math.max(0.5, 20 * easing),
                        appliedEasing = Math.max(0.3, easing);

                    direction = (z < height) ? direction : -direction;

                    obj.rotation(obj.rotationX() - rotationSpeedX * appliedEasing, obj.rotationY() - rotationSpeedY * appliedEasing, obj.rotationZ() - rotationSpeedZ * appliedEasing)
                        .move(0, 0, moveZ * direction)
                        .update();
                }

                $(shadow).css({
                    opacity: (depth - z) / depth
                });
            }, 1000 / 40);
    };

    this.init = function () {
        if (!this.isSupported()) {
            return null;
        }

        var $stage = $(settings.stage);

        stage = Sprite3D.stage($stage.get(0));

        shadow = createPlane(
        new Dimension3D(objDimension.w + 40, objDimension.h + 40, 0),
        new Point3D(-$stage.width() / 2, -$stage.height() / 2, depth),
        new Point3D(objPosition.x - objDimension.w / 2, objPosition.y - objDimension.h / 2, 0),
        new Rotation3D(0, 0, 0),
            ".shadow");

        obj = createBox(
        objDimension,
        new Point3D(-$stage.width() / 2, -$stage.height() / 2, depth),
        objPosition,
        objRotation,
        objClass);

        // create a cylinder to work as side of the coin
        var facets = 80;
        for (var i = 0; i < facets; ++i) {
            var radius = objDimension.w / 2,
                degree = 360 / facets,
                radian = degree * Math.PI / 180,
                distance = radius * Math.cos(radian / 2),
                w = 2 * radius * Math.sin(radian / 2),
                h = objDimension.d,
                x = Math.ceil(distance * Math.cos(radian * i)),
                y = Math.ceil(distance * Math.sin(radian * i));

            var side = createPlane(
            new Dimension3D(w, h, 0),
            new Point3D(w / 2, h / 2, 0),
            new Point3D(x, y, 0),
            new Rotation3D(90, degree * i + 90, 0),
                ".side");
            obj.appendChild(side);
        }

        stage.appendChild(shadow);
        stage.appendChild(obj);

        return this;
    };

    return this.init();
};

var coin1 = new Coin({
    stage: "#stage",
    dimension: new Dimension3D(300, 300, 20),
    position: new Point3D(0, 0, 0),
    rotation: new Rotation3D(0, 0, 0)
});

$("#stage").click(function () {
    coin1.toss();
    return false;
});
});
