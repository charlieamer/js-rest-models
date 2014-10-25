var mergeObjects = function(objFrom, objTo) {
  for (var attrname in objFrom) { objTo[attrname] = objFrom[attrname]; }
}

model = function(name, id_path) {
  this.collection = {};
  var _this = this;
  var standardCall = function(url, type, data, done) {
    var params = {
      type: type,
      url: url,
      contentType: "application/json",
      success: function(ret) {
        if (ret && ret[id_path])
          _this.collection[ret[id_path]] = ret;
        if (done)
          done(ret);
        models.callCallbacks();
      }
    };
    if (data)
      params.data = JSON.stringify(data);
    $.ajax(params);
  }
  this.create = function(data, done) {
    standardCall(models.path + name, "POST", data, done);
  };
  this.read = function(id, done, force) {
    options = options || {};
    if (!_this.collection[id] || force) {
      standardCall(models.path + name + "/" + id, "GET", null, done);
    } else {
      done(_this.collection[id]);
    }
  };
  this.update = function(id, data, done) {
    if (id)
      data[id_path] = id;
    standardCall(models.path + name + "/" + id, "PUT", data, done);
  }
  this.delete = function(id, done) {
    standardCall(models.path + name + "/" + id, "DELETE", null, function(ret) {
      delete _this.collection[id];
      if (done)
        done(ret);
    });
  }
  this.fillAll = function(done) {
    standardCall(models.path + pluralize(name), "GET", null, function(ret) {
      _this.fill(ret);
      if (done)
        done(ret);
    });
  }
  this.fillFromUrl = function(url, done) {
    standardCall(url, "GET", null, function(ret) {
      _this.fill(ret);
      if (done)
        done(ret);
    });
  }
  this.clear = function() {
    _this.collection = {}
  }
  this.fill = function(data) {
    data.forEach(function(obj) {
      _this.collection[obj[id_path]] = obj;
    });
  }
}


models = {
  init: function(path) {
    models.path = path;
    if (path[path.length-1] != "/")
      models.path += "/";
  },
  add: function(name, id_path) {
    models[name] = new model(name, id_path || "id", models.path);
  },
  addCallback: function(func) {
    models.callbacks.push(func);
  },
  callCallbacks: function() {
    models.callbacks.forEach(function(callback){
      callback();
    });
  }
}

models.callbacks = [];

