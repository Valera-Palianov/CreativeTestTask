import 'normalize.css';
import './index.css'

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

requireAll(require.context('./components', true, /\.js$/));