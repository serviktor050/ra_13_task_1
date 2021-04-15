import {
  takeLatest,
  put,
  spawn,
  debounce,
  retry,
  fork,
} from "redux-saga/effects";
import {
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
  emptySearchField,
} from "../actions/actionCreators";
import {
  CHANGE_SEARCH_FIELD,
  SEARCH_SKILLS_REQUEST,
} from "../actions/actionTypes";
import { searchSkills } from "../api/index";

function filterChangeSearchAction({ type }) {
  //Ждем необходимый type
  return type === CHANGE_SEARCH_FIELD;
}

// worker
function* handleChangeSearchSaga(action) {
  //При получении action с нужным type геренируем новый action с type SEARCH_SKILLS_REQUEST
  yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
  // Отслеживаем нужный action и запускает необходимую работу
  yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

// worker
function* handleSearchSkillsSaga(action) {
  try {
    const retryCount = 3;
    const retryDelay = 1 * 1000; // ms
    const data = yield retry(
      retryCount,
      retryDelay,
      searchSkills,
      action.payload.search
    );
    yield put(searchSkillsSuccess(data));
  } catch (e) {
    yield put(searchSkillsFailure(e.message));
  }
}

// worker
function* handleRequestSaga(action) {
  if (action.payload.search === "") {
    yield put(emptySearchField());
  } else {
    yield fork(handleSearchSkillsSaga, action);
  }
}

// watcher
function* watchSearchSkillsSaga() {
  yield takeLatest(SEARCH_SKILLS_REQUEST, handleRequestSaga);
}

//Корневая Saga
export default function* saga() {
  yield spawn(watchChangeSearchSaga);
  yield spawn(watchSearchSkillsSaga);
}
