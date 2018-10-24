angular.module("chess")

.controller("listController", ['$scope', 'socketService', 'gameData', '$state', function ($scope, socketService, gameData, $state) {

    $scope.list = [];

    $scope.userName = "";

    $scope.failed = false;

    $scope.stockfishAvailable = false;

    socketService.on("connect", function () {
        $scope.id = socketService.socket.id;
    });

    socketService.emit("get-list");

    socketService.on("add-games", function (data) {
        $scope.list = $scope.list.concat(data);
    });

    socketService.on("update-list", function (data) {
        $scope.list[data.index] = data.game;
    });

    socketService.on("remove-from-list", function (data) {
        $scope.list.splice(data.index, 1);
    });

    socketService.on("game-created", function (data) {
        gameData.started = true;

        if (data) {
            gameData.opponent = data.player;

            gameData.player = $scope.userName === "" ? "Anonymous" : $scope.userName;

            gameData.side = -data.side;

            gameData.turn = !data.turn;
        }

        $state.go("game");
    });

    $scope.createGame = function () {
        if ($scope.userName && $scope.userName != "") {
            $scope.failed = false;
            socketService.emit("new-game", {
                'player': $scope.userName,
                'side': ((Math.random() > 0.5) ? 'black' : 'white'),
                'id': socketService.socket.id
            });
        } else {
            $scope.failed = true;
        }
    }

    $scope.joinGame = function (id, opponent, side) {

        gameData.opponent = opponent;

        gameData.player = $scope.userName === "" ? "Anonymous" : $scope.userName;

        gameData.side = (side === "white") ? 1 : -1;

        gameData.turn = (side === "white") ? true : false;


        gameData.started = true;

        socketService.emit("join-game", {
            'owner': id,
            'opponent': socketService.socket.id,
            'gameData': gameData,
            'againstStockfish': (id === 0)
        });

        gameData.againstStockfish = (id === 0);

    }
}]);
